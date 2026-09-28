import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { address: true, items: true } });
  if (!order?.address) notFound();
  return <main className="home-shell order-success-page"><section className="order-success-card"><div className="success-mark">✓</div><p className="eyebrow">سفارش ثبت شد</p><h1>سفارش تو با موفقیت ساخته شد.</h1><p>محصول‌ها فعلاً برای سفارش رزرو شده‌اند. در مرحله بعد امکان پرداخت و ارسال رسید به این صفحه اضافه می‌شود.</p><div className="order-reference"><span>کد پیگیری سفارش</span><strong>{order.id}</strong></div><div className="order-next"><strong>ارسال به</strong><p>{order.address.recipientName} · {order.address.province}، {order.address.city}</p><small>وضعیت: در انتظار پرداخت</small></div><div className="hero-actions"><a href="/" className="primary-action">بازگشت به خانه</a><a href="/recommendations" className="secondary-action">مشاهده محصولات</a></div></section></main>;
}
