import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { expireStaleOrders } from "@/lib/order-inventory";
import { logoutCustomer } from "./actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
const statusLabels: Record<string, string> = { DRAFT: "پیش‌نویس", PENDING_PAYMENT: "در انتظار پرداخت", PAID: "پرداخت تأیید شد", PROCESSING: "در حال آماده‌سازی", SHIPPED: "ارسال‌شده", DELIVERED: "تحویل‌شده", CANCELLED: "لغوشده", REFUNDED: "بازپرداخت‌شده" };

export default async function AccountPage() {
  const user = await requireCustomer();
  await expireStaleOrders();
  const [orders, profiles] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, include: { items: { include: { product: true } }, paymentReceipt: true, address: true }, orderBy: { createdAt: "desc" } }),
    prisma.beautyProfile.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } })
  ]);
  return <main className="home-shell account-page"><section className="account-hero"><div><p className="eyebrow">حساب شخصی</p><h1>سلام {user.displayName || "دوست BeautyOS"}</h1><p>سفارش‌ها، پرداخت‌ها و Beauty Passport تو اینجا قرار دارند.</p></div><div className="account-user"><span>{user.displayName?.charAt(0) || "ک"}</span><div><strong>{user.displayName || "کاربر BeautyOS"}</strong><small dir="ltr">{user.phone}</small></div><form action={logoutCustomer}><button type="submit">خروج</button></form></div></section>
    <section className="account-shortcuts"><a href="/passport"><span>◎</span><div><strong>Beauty Passport</strong><small>{profiles.length ? "ویرایش یا ساخت پروفایل جدید" : "برای پیشنهادهای شخصی بساز"}</small></div></a><a href="/routine"><span>☼</span><div><strong>روتین من</strong><small>روتین صبح و شب را ببین</small></div></a><a href="/cart"><span>▣</span><div><strong>سبد خرید</strong><small>انتخاب‌های فعلی را ادامه بده</small></div></a></section>
    <section className="account-orders"><div className="section-intro"><div><h2>سفارش‌های من</h2><p>آخرین وضعیت خرید و پرداخت را دنبال کن.</p></div></div>{orders.length ? <div className="customer-order-list">{orders.map((order) => <article key={order.id}><header><div><span>کد سفارش</span><strong>{order.id.slice(-8)}</strong></div><span className={`order-status ${order.status.toLowerCase()}`}>{statusLabels[order.status]}</span></header><div className="customer-order-products">{order.items.map((item) => <p key={item.id}>{item.quantity} × {item.product.title}</p>)}</div><footer><div><strong>{formatPrice(order.total)} تومان</strong><small>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(order.createdAt)}</small></div>{order.status === "PENDING_PAYMENT" ? <a href={`/payment/${order.id}`} className="primary-action">{order.paymentReceipt?.status === "PENDING" ? "مشاهده رسید" : "پرداخت و ارسال رسید"}</a> : null}{order.status === "CANCELLED" ? <span>مهلت پرداخت تمام شده است</span> : null}</footer>{order.paymentReceipt?.status === "REJECTED" ? <div className="customer-order-warning">رسید رد شده: {order.paymentReceipt.adminNote || "لطفاً تصویر رسید جدید ارسال کن."}</div> : null}</article>)}</div> : <div className="empty-state"><h2>هنوز سفارشی نداری.</h2><p>از پیشنهادهای شخصی شروع کن و محصول مناسب پوستت را پیدا کن.</p><a href="/recommendations" className="primary-action">دیدن پیشنهادها</a></div>}</section>
  </main>;
}
