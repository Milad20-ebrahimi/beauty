import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { expireStaleOrders } from "@/lib/order-inventory";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await expireStaleOrders();
  const order = await prisma.order.findUnique({ where: { id }, include: { address: true, items: true } });
  if (!order?.address) notFound();
  return <main className="home-shell order-success-page"><section className="order-success-card"><div className="success-mark">✓</div><p className="eyebrow">سفارش ثبت شد</p><h1>سفارش تو با موفقیت ساخته شد.</h1><p>محصول‌ها برای سفارش رزرو شده‌اند. حالا پرداخت را انجام بده و تصویر رسید را بفرست.</p><div className="order-reference"><span>کد پیگیری سفارش</span><strong>{order.id}</strong></div><div className="order-next"><strong>ارسال به</strong><p>{order.address.recipientName} · {order.address.province}، {order.address.city}</p><small>وضعیت: در انتظار پرداخت</small></div><div className="hero-actions"><a href={`/payment/${order.id}`} className="primary-action">پرداخت و ارسال رسید</a><a href="/" className="secondary-action">فعلاً بعداً پرداخت می‌کنم</a></div></section></main>;
}
