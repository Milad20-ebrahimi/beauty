import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { markAllNotificationsRead, openNotification } from "./actions";

export const dynamic = "force-dynamic";
const typeLabels: Record<string, { icon: string; label: string }> = { ORDER: { icon: "□", label: "سفارش" }, PAYMENT: { icon: "$", label: "پرداخت" }, SHIPPING: { icon: "↗", label: "ارسال" }, REVIEW: { icon: "★", label: "نظر" }, SYSTEM: { icon: "●", label: "سیستم" } };

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ allRead?: string }> }) {
  const user = await requireCustomer();
  const query = await searchParams;
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const unread = notifications.filter((item) => !item.readAt).length;
  return <main className="home-shell notifications-page"><section className="compact-hero notifications-hero"><div className="hero-content"><p className="eyebrow">مرکز پیام‌های من</p><h1>اعلان‌ها</h1><p className="hero-copy">تغییر وضعیت سفارش، پرداخت، ارسال و نتیجه بررسی نظرت را اینجا دنبال کن.</p></div><div className="notification-count"><strong>{new Intl.NumberFormat("fa-IR").format(unread)}</strong><span>خوانده‌نشده</span></div></section>
    {query.allRead ? <div className="cart-message success">همه اعلان‌ها خوانده‌شده علامت خوردند.</div> : null}
    <div className="notification-toolbar"><span>{new Intl.NumberFormat("fa-IR").format(notifications.length)} پیام در حساب تو</span>{unread ? <form action={markAllNotificationsRead}><button>خواندن همه</button></form> : <small>پیام خوانده‌نشده‌ای نداری.</small>}</div>
    {notifications.length ? <section className="notification-list">{notifications.map((item) => { const meta = typeLabels[item.type] || typeLabels.SYSTEM; return <article key={item.id} className={item.readAt ? "read" : "unread"}><span className="notification-icon">{meta.icon}</span><div><header><span>{meta.label}</span><time>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</time></header><h2>{item.title}</h2><p>{item.message}</p></div><form action={openNotification}><input type="hidden" name="id" value={item.id} /><button>{item.href ? "مشاهده جزئیات ←" : item.readAt ? "خوانده‌شده" : "خواندن پیام"}</button></form></article>; })}</section> : <section className="empty-state"><h2>هنوز اعلانی نداری.</h2><p>بعد از ثبت سفارش یا بررسی پرداخت، پیام‌های مربوط به آن اینجا نمایش داده می‌شوند.</p><a href="/products" className="primary-action">مشاهده فروشگاه</a></section>}
  </main>;
}
