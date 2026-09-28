import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { DISCOUNT_COOKIE, resolveDiscount } from "@/lib/discount";
import { placeOrder } from "./actions";
import { ShippingSelector } from "./shipping-selector";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
const validationMessages: Record<string, string> = {
  name: "نام و نام خانوادگی را کامل وارد کن.",
  phone: "شماره موبایل معتبر نیست؛ نمونه صحیح: 09123456789 یا +989123456789.",
  province: "نام استان را وارد کن.",
  city: "نام شهر را وارد کن.",
  address: "آدرس خیلی کوتاه است؛ خیابان، کوچه، پلاک و واحد را بنویس.",
  postal: "کد پستی باید دقیقاً ۱۰ رقم باشد؛ اگر در دسترس نیست می‌توانی آن را خالی بگذاری.",
  shipping: "یک روش ارسال فعال انتخاب کن.",
  discount_invalid: "کد تخفیف دیگر معتبر یا فعال نیست؛ به سبد برگرد و کد را بررسی کن.",
  discount_expired: "مهلت کد تخفیف تمام شده است؛ به سبد برگرد و کد را حذف کن.",
  discount_limit: "ظرفیت استفاده از کد تخفیف تمام شده است.",
  discount_customer_limit: "سقف استفاده شما از این کد تخفیف تمام شده است.",
  discount_minimum: "مبلغ سفارش دیگر به حداقل لازم برای این کد نمی‌رسد.",
  discount_scope: "کد تخفیف برای محصولات فعلی سبد قابل استفاده نیست.",
  discount_not_started: "زمان استفاده از این کد هنوز شروع نشده است."
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  const discountCode = cookieStore.get(DISCOUNT_COOKIE)?.value;
  const [cart, shippingMethods] = await Promise.all([sessionId ? prisma.cart.findFirst({ where: { sessionId }, include: { items: { include: { product: { include: { media: { take: 1, orderBy: { sortOrder: "asc" } } } } } } } }) : null, prisma.shippingMethod.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })]);
  if (!cart?.items.length) redirect("/cart");
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountResult = discountCode ? await resolveDiscount(prisma, discountCode, cart.items.map((item) => ({ productId: item.product.id, categoryId: item.product.categoryId, price: item.product.price, quantity: item.quantity }))) : null;
  const discountAmount = discountResult?.ok ? discountResult.amount : 0;

  return <main className="home-shell checkout-page">
    <section className="compact-hero results-header"><div className="hero-content"><p className="eyebrow">تسویه‌حساب · مرحله ۱</p><h1>اطلاعات تحویل سفارش</h1><p className="hero-copy">اطلاعات را دقیق وارد کن. بعد از ثبت، سفارش برای پرداخت آماده می‌شود.</p></div></section>
    {params.error && validationMessages[params.error] ? <div className="cart-message error"><strong>این بخش نیاز به اصلاح دارد:</strong> {validationMessages[params.error]}</div> : null}
    {params.error === "stock" ? <div className="cart-message error">موجودی یکی از محصولات تغییر کرده است. لطفاً سبد را دوباره بررسی کن.</div> : null}
    <div className="checkout-layout">
      <form action={placeOrder} className="checkout-form">
        <div className="checkout-section-head"><span>۱</span><div><h2>تحویل‌گیرنده</h2><p>سفارش به نام چه کسی ارسال شود؟</p></div></div>
        <div className="checkout-grid"><label>نام و نام خانوادگی<input name="recipientName" required minLength={2} autoComplete="name" placeholder="مثلاً میلاد ابراهیمی" /></label><label>شماره موبایل<input name="phone" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09123456789" /><small>اعداد فارسی، انگلیسی و فرمت +98 پذیرفته می‌شود.</small></label><label>استان<input name="province" required placeholder="آذربایجان شرقی" /></label><label>شهر<input name="city" required placeholder="تبریز" /></label><label className="field-wide">آدرس کامل<textarea name="addressLine" required minLength={6} rows={4} placeholder="خیابان، کوچه، پلاک، واحد" /></label><label>کد پستی ده‌رقمی <small>اختیاری</small><input name="postalCode" inputMode="numeric" dir="ltr" maxLength={10} placeholder="1234567890" /><small>اگر کدپستی را نمی‌دانی، این قسمت را خالی بگذار.</small></label><label>توضیحات تحویل <small>اختیاری</small><input name="deliveryNote" placeholder="مثلاً قبل از ارسال تماس بگیرید" /></label></div>
        {shippingMethods.length ? <ShippingSelector methods={shippingMethods} subtotal={subtotal} /> : <div className="cart-message error">هیچ روش ارسال فعالی وجود ندارد؛ با پشتیبانی تماس بگیر.</div>}
        <div className="checkout-form-note"><strong>بعد از ثبت چه می‌شود؟</strong><p>محصول‌ها برای این سفارش رزرو می‌شوند و در مرحله بعد روش پرداخت و بارگذاری رسید را اضافه می‌کنیم.</p></div>
        <button type="submit" className="primary-action" disabled={!shippingMethods.length}>ثبت سفارش و ادامه</button>
      </form>
      <aside className="checkout-summary"><p className="admin-kicker">خلاصه خرید</p><h2>{formatPrice(cart.items.reduce((sum, item) => sum + item.quantity, 0))} کالا</h2><div className="checkout-products">{cart.items.map((item) => <div key={item.id}>{item.product.media[0] ? <Image src={item.product.media[0].url} alt={item.product.title} width={48} height={48} /> : <span /> }<p><strong>{item.product.title}</strong><small>{item.quantity} عدد</small></p><b>{formatPrice(item.product.price * item.quantity)}</b></div>)}</div><dl className="checkout-price-lines"><div><dt>جمع محصولات</dt><dd>{formatPrice(subtotal)} تومان</dd></div>{discountAmount ? <div className="discount-line"><dt>تخفیف {discountCode}</dt><dd>− {formatPrice(discountAmount)} تومان</dd></div> : null}</dl><div className="cart-total"><span>پس از تخفیف</span><strong>{formatPrice(Math.max(0, subtotal - discountAmount))} تومان</strong></div><small className="muted">هزینه ارسال براساس انتخاب تو به مبلغ نهایی اضافه می‌شود.</small><a href="/cart" className="secondary-action">بازگشت و ویرایش سبد</a></aside>
    </div>
  </main>;
}
