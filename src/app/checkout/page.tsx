import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE } from "@/lib/cart";
import { placeOrder } from "./actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const sessionId = (await cookies()).get(CART_COOKIE)?.value;
  const cart = sessionId ? await prisma.cart.findFirst({ where: { sessionId }, include: { items: { include: { product: { include: { media: { take: 1, orderBy: { sortOrder: "asc" } } } } } } } }) : null;
  if (!cart?.items.length) redirect("/cart");
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return <main className="home-shell checkout-page">
    <section className="compact-hero results-header"><div className="hero-content"><p className="eyebrow">تسویه‌حساب · مرحله ۱</p><h1>اطلاعات تحویل سفارش</h1><p className="hero-copy">اطلاعات را دقیق وارد کن. بعد از ثبت، سفارش برای پرداخت آماده می‌شود.</p></div></section>
    {params.error === "validation" ? <div className="cart-message error">اطلاعات کامل نیست؛ شماره موبایل و کدپستی را با اعداد انگلیسی یا فارسی درست وارد کن.</div> : null}
    {params.error === "stock" ? <div className="cart-message error">موجودی یکی از محصولات تغییر کرده است. لطفاً سبد را دوباره بررسی کن.</div> : null}
    <div className="checkout-layout">
      <form action={placeOrder} className="checkout-form">
        <div className="checkout-section-head"><span>۱</span><div><h2>تحویل‌گیرنده</h2><p>سفارش به نام چه کسی ارسال شود؟</p></div></div>
        <div className="checkout-grid"><label>نام و نام خانوادگی<input name="recipientName" required minLength={3} autoComplete="name" placeholder="مثلاً میلاد ابراهیمی" /></label><label>شماره موبایل<input name="phone" required inputMode="tel" autoComplete="tel" placeholder="09123456789" /></label><label>استان<input name="province" required placeholder="آذربایجان شرقی" /></label><label>شهر<input name="city" required placeholder="تبریز" /></label><label className="field-wide">آدرس کامل<textarea name="addressLine" required minLength={10} rows={4} placeholder="خیابان، کوچه، پلاک، واحد" /></label><label>کد پستی ده‌رقمی <small>اختیاری</small><input name="postalCode" inputMode="numeric" placeholder="1234567890" /></label><label>توضیحات تحویل <small>اختیاری</small><input name="deliveryNote" placeholder="مثلاً قبل از ارسال تماس بگیرید" /></label></div>
        <div className="checkout-form-note"><strong>بعد از ثبت چه می‌شود؟</strong><p>محصول‌ها برای این سفارش رزرو می‌شوند و در مرحله بعد روش پرداخت و بارگذاری رسید را اضافه می‌کنیم.</p></div>
        <button type="submit" className="primary-action">ثبت سفارش و ادامه</button>
      </form>
      <aside className="checkout-summary"><p className="admin-kicker">خلاصه خرید</p><h2>{formatPrice(cart.items.reduce((sum, item) => sum + item.quantity, 0))} کالا</h2><div className="checkout-products">{cart.items.map((item) => <div key={item.id}>{item.product.media[0] ? <Image src={item.product.media[0].url} alt={item.product.title} width={48} height={48} /> : <span /> }<p><strong>{item.product.title}</strong><small>{item.quantity} عدد</small></p><b>{formatPrice(item.product.price * item.quantity)}</b></div>)}</div><div className="cart-total"><span>مجموع سفارش</span><strong>{formatPrice(subtotal)} تومان</strong></div><a href="/cart" className="secondary-action">بازگشت و ویرایش سبد</a></aside>
    </div>
  </main>;
}
