import Image from "next/image";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { removeCartItem, updateCartItem } from "./actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

export default async function CartPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  const cart = sessionId ? await prisma.cart.findFirst({ where: { sessionId }, include: { items: { include: { product: { include: { brand: true, media: { take: 1, orderBy: { sortOrder: "asc" } } } } }, orderBy: { createdAt: "desc" } } } }) : null;
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return <main className="home-shell cart-page">
    <section className="compact-hero cart-header"><div className="hero-content"><p className="eyebrow">سبد خرید</p><h1>انتخاب‌های تو برای خرید</h1><p className="hero-copy">تعداد و موجودی را بررسی کن؛ در مرحله بعد اطلاعات ارسال و پرداخت را اضافه می‌کنیم.</p></div><div className="cart-count-card"><strong>{formatPrice(itemCount)}</strong><span>کالا در سبد</span></div></section>
    {params.added ? <div className="cart-message success">محصول با موفقیت به سبد خرید اضافه شد.</div> : null}
    {params.from ? <div className="cart-message success">محصولات انتخابی روتین، بدون تکرار به سبد اضافه شدند.</div> : null}
    {params.updated ? <div className="cart-message success">تعداد محصول به‌روزرسانی شد.</div> : null}
    {params.removed ? <div className="cart-message">محصول از سبد حذف شد.</div> : null}
    {params.error === "stock" ? <div className="cart-message error">تعداد درخواستی بیشتر از موجودی بود؛ بیشترین تعداد موجود ثبت شد.</div> : null}
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
      <aside className="cart-summary"><p className="admin-kicker">خلاصه سفارش</p><h2>مبلغ قابل پرداخت</h2><dl><div><dt>جمع محصولات</dt><dd>{formatPrice(subtotal)} تومان</dd></div><div><dt>هزینه ارسال</dt><dd>فعلاً رایگان</dd></div></dl><div className="cart-total"><span>مجموع فعلی</span><strong>{formatPrice(subtotal)} تومان</strong></div><a href="/checkout" className="primary-action">ادامه و ثبت آدرس</a><small>در صفحه بعد اطلاعات تحویل را وارد و سفارش را ثبت می‌کنی.</small><a href="/recommendations" className="secondary-action">ادامه انتخاب محصولات</a></aside>
    </div> : <section className="empty-state cart-empty"><span>سبد تو خالی است</span><h2>هنوز محصولی انتخاب نکرده‌ای.</h2><p>از پیشنهادهای شخصی یا روتین هوشمند شروع کن.</p><div><a href="/recommendations" className="primary-action">دیدن پیشنهادها</a><a href="/routine" className="secondary-action">ساخت روتین</a></div></section>}
  </main>;
}
