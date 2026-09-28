import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { reviewPaymentReceipt, updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
const statusLabels: Record<string, string> = { DRAFT: "پیش‌نویس", PENDING_PAYMENT: "در انتظار پرداخت", PAID: "پرداخت‌شده", PROCESSING: "در حال آماده‌سازی", SHIPPED: "ارسال‌شده", DELIVERED: "تحویل‌شده", CANCELLED: "لغوشده", REFUNDED: "بازپرداخت‌شده" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string; receipt?: string }> }) {
  const params = await searchParams;
  const orders = await prisma.order.findMany({ include: { user: true, address: true, paymentReceipt: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } });
  return <main className="admin-page">
    <header className="admin-page-header"><div><p className="admin-kicker">فروش و ارسال</p><h1>سفارش‌ها</h1><p>سفارش جدید را بررسی کن، وضعیت را تغییر بده و قبل از ارسال اطلاعات تحویل را بخوان.</p></div><a href="/" className="secondary-action">مشاهده فروشگاه</a></header>
    <section className="admin-help-note"><strong>راهنمای وضعیت:</strong><p>«در انتظار پرداخت» یعنی فقط سفارش ثبت شده؛ بعد از تأیید پرداخت آن را پرداخت‌شده و سپس در حال آماده‌سازی کن. لغو سفارش، موجودی رزروشده را آزاد می‌کند.</p></section>
    {params.updated ? <div className="admin-alert success">وضعیت سفارش به‌روزرسانی شد.</div> : null}
    {params.receipt === "approve" ? <div className="admin-alert success">رسید تأیید شد و سفارش به وضعیت پرداخت‌شده رفت.</div> : null}
    {params.receipt === "reject" ? <div className="admin-alert success">رسید رد شد؛ مشتری توضیح شما را می‌بیند و می‌تواند رسید جدید بفرستد.</div> : null}
    {params.error ? <div className="admin-alert error">این تغییر وضعیت قابل انجام نیست.</div> : null}
    <section className="admin-order-list">{orders.length ? orders.map((order) => <article className="admin-order-card" key={order.id}>
      <header><div><span>سفارش</span><strong>{order.id.slice(-8)}</strong><small>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</small></div><span className={`order-status ${order.status.toLowerCase()}`}>{statusLabels[order.status]}</span></header>
      <div className="admin-order-body"><div><h3>مشتری و تحویل</h3><p>{order.address?.recipientName || order.user?.displayName || "بدون نام"}</p><p>{order.address?.phone || order.user?.phone || "بدون شماره"}</p><small>{order.address ? `${order.address.province}، ${order.address.city}، ${order.address.addressLine}` : "آدرس ثبت نشده"}</small></div><div><h3>محصولات</h3>{order.items.map((item) => <p key={item.id}>{item.quantity} × {item.product.title}</p>)}</div><div className="admin-order-total"><h3>مبلغ سفارش</h3><strong>{formatPrice(order.total)} تومان</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} کالا</small></div></div>
      {order.paymentReceipt ? <section className="admin-receipt"><a href={order.paymentReceipt.imageUrl} target="_blank" rel="noreferrer"><Image src={order.paymentReceipt.imageUrl} alt="رسید پرداخت مشتری" width={110} height={110} /></a><div><h3>رسید پرداخت</h3><strong>{order.paymentReceipt.status === "PENDING" ? "منتظر بررسی شما" : order.paymentReceipt.status === "APPROVED" ? "تأییدشده" : "ردشده"}</strong>{order.paymentReceipt.customerNote ? <p>توضیح مشتری: {order.paymentReceipt.customerNote}</p> : null}</div>{order.paymentReceipt.status === "PENDING" ? <form action={reviewPaymentReceipt}><input type="hidden" name="receiptId" value={order.paymentReceipt.id} /><label>توضیح رد رسید <small>برای تأیید لازم نیست</small><input name="adminNote" placeholder="مثلاً مبلغ یا تصویر خوانا نیست" /></label><div><button name="decision" value="reject" className="receipt-reject">رد رسید</button><button name="decision" value="approve" className="receipt-approve">تأیید پرداخت</button></div></form> : order.paymentReceipt.adminNote ? <p className="receipt-admin-note">توضیح مدیر: {order.paymentReceipt.adminNote}</p> : null}</section> : <div className="admin-no-receipt">مشتری هنوز رسید پرداخت ارسال نکرده است.</div>}
      <footer><form action={updateOrderStatus}><input type="hidden" name="orderId" value={order.id} /><label>تغییر وضعیت<select name="status" defaultValue={order.status} disabled={order.status === "CANCELLED"}>{Object.entries(statusLabels).filter(([value]) => !["DRAFT", "REFUNDED", "PAID"].includes(value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="submit" className="primary-action" disabled={order.status === "CANCELLED"}>ثبت وضعیت</button></form>{order.status === "PENDING_PAYMENT" ? <small>وضعیت «پرداخت‌شده» فقط با تأیید رسید فعال می‌شود.</small> : null}</footer>
    </article>) : <div className="admin-empty"><strong>هنوز سفارشی ثبت نشده است.</strong><p>بعد از ثبت سفارش مشتری، اطلاعات آن اینجا نمایش داده می‌شود.</p></div>}</section>
  </main>;
}
