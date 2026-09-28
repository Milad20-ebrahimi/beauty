import Image from "next/image";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { DISCOUNT_COOKIE, resolveDiscount } from "@/lib/discount";
import { removeCartItem, updateCartItem } from "./actions";
import { applyDiscountCode, removeDiscountCode } from "./discount-actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
const discountErrors: Record<string, string> = {
  empty: "کد تخفیف را وارد کن.", invalid: "این کد معتبر یا فعال نیست.", not_started: "زمان استفاده از این کد هنوز شروع نشده است.", expired: "مهلت استفاده از این کد تمام شده است.", minimum: "مبلغ سبد به حداقل خرید این کد نرسیده است.", scope: "این کد برای محصولات فعلی سبد نیست.", limit: "ظرفیت استفاده از این کد تمام شده است.", customer_limit: "سقف استفاده شما از این کد تمام شده است."
};

export default async function CartPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  const savedDiscountCode = cookieStore.get(DISCOUNT_COOKIE)?.value;
  const cart = sessionId ? await prisma.cart.findFirst({ where: { sessionId }, include: { items: { include: { product: { include: { brand: true, media: { take: 1, orderBy: { sortOrder: "asc" } } } } }, orderBy: { createdAt: "desc" } } } }) : null;
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const discountResult = savedDiscountCode && items.length ? await resolveDiscount(prisma, savedDiscountCode, items.map((item) => ({ productId: item.product.id, categoryId: item.product.categoryId, price: item.product.price, quantity: item.quantity }))) : null;
  const discountAmount = discountResult?.ok ? discountResult.amount : 0;

  return <main className="home-shell cart-page">
    <section className="compact-hero cart-header"><div className="hero-content"><p className="eyebrow">سبد خرید</p><h1>انتخاب‌های تو برای خرید</h1><p className="hero-copy">تعداد و موجودی را بررسی کن؛ در مرحله بعد اطلاعات ارسال و پرداخت را اضافه می‌کنیم.</p></div><div className="cart-count-card"><strong>{formatPrice(itemCount)}</strong><span>کالا در سبد</span></div></section>
    {params.added ? <div className="cart-message success">محصول با موفقیت به سبد خرید اضافه شد.</div> : null}
    {params.from ? <div className="cart-message success">محصولات انتخابی روتین، بدون تکرار به سبد اضافه شدند.</div> : null}
    {params.updated ? <div className="cart-message success">تعداد محصول به‌روزرسانی شد.</div> : null}
    {params.removed ? <div className="cart-message">محصول از سبد حذف شد.</div> : null}
    {params.error === "stock" ? <div className="cart-message error">تعداد درخواستی بیشتر از موجودی بود؛ بیشترین تعداد موجود ثبت شد.</div> : null}
    {params.discountApplied ? <div className="cart-message success">کد تخفیف اعمال شد و در مرحله پرداخت هم دوباره بررسی می‌شود.</div> : null}
    {params.discountRemoved ? <div className="cart-message">کد تخفیف حذف شد.</div> : null}
    {params.discountError ? <div className="cart-message error">{discountErrors[params.discountError] || "کد تخفیف قابل استفاده نیست."}</div> : null}
    {items.length ? <div className="cart-layout">
      <section className="cart-items" aria-label="محصولات سبد خرید">{items.map((item) => {
        const available = Math.max(0, item.product.stock - item.product.reservedStock);
        const image = item.product.media[0];
        return <article className="cart-item" key={item.id}>
          <a href={`/products/${item.product.slug}`} className="cart-item-image">{image ? <Image src={image.url} alt={image.alt || item.product.title} width={150} height={150} /> : <span>بدون تصویر</span>}</a>
          <div className="cart-item-main"><span>{item.product.brand.name}</span><h2><a href={`/products/${item.product.slug}`}>{item.product.title}</a></h2><small className={available > 0 ? "in-stock" : "out-of-stock"}>{available > 0 ? `${formatPrice(available)} عدد موجود` : "ناموجود"}</small>
            <div className="cart-item-actions"><form action={updateCartItem}><input type="hidden" name="itemId" value={item.id} /><label>تعداد<input name="quantity" type="number" min="1" max={Math.max(1, Math.min(20, available))} defaultValue={Math.min(item.quantity, Math.max(1, available))} /></label><button type="submit">به‌روزرسانی</button></form><form action={removeCartItem}><input type="hidden" name="itemId" value={item.id} /><button type="submit" className="remove">حذف</button></form></div>
          </div>
          <div className="cart-item-price"><strong>{formatPrice(item.product.price * item.quantity)} تومان</strong>{item.quantity > 1 ? <small>هر عدد {formatPrice(item.product.price)} تومان</small> : null}</div>
        </article>;
      })}</section>
      <aside className="cart-summary"><p className="admin-kicker">خلاصه سفارش</p><h2>مبلغ قابل پرداخت</h2><dl><div><dt>جمع محصولات</dt><dd>{formatPrice(subtotal)} تومان</dd></div>{discountAmount ? <div className="discount-line"><dt>تخفیف</dt><dd>− {formatPrice(discountAmount)} تومان</dd></div> : null}<div><dt>هزینه ارسال</dt><dd>در مرحله بعد</dd></div></dl><div className="discount-box"><strong>کد تخفیف داری؟</strong>{discountAmount ? <><span><b>{savedDiscountCode}</b> با موفقیت اعمال شده است.</span><form action={removeDiscountCode}><button type="submit">حذف کد</button></form></> : <form action={applyDiscountCode}><input name="code" dir="ltr" placeholder="مثلاً WELCOME10" required /><button type="submit">اعمال</button></form>}</div><div className="cart-total"><span>مجموع فعلی</span><strong>{formatPrice(Math.max(0, subtotal - discountAmount))} تومان</strong></div><a href="/checkout" className="primary-action">ادامه و ثبت آدرس</a><small>تخفیف هنگام ثبت سفارش دوباره اعتبارسنجی می‌شود.</small><a href="/recommendations" className="secondary-action">ادامه انتخاب محصولات</a></aside>
    </div> : <section className="empty-state cart-empty"><span>سبد تو خالی است</span><h2>هنوز محصولی انتخاب نکرده‌ای.</h2><p>از پیشنهادهای شخصی یا روتین هوشمند شروع کن.</p><div><a href="/recommendations" className="primary-action">دیدن پیشنهادها</a><a href="/routine" className="secondary-action">ساخت روتین</a></div></section>}
  </main>;
}
