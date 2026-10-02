import { ArrowLeft, CheckCircle, Clock, CurrencyCircleDollar, Package, ShoppingBag, Star, Users } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const saleStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const formatNumber = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const formatMoney = (value: number) => `${formatNumber(value)} تومان`;
const statusLabels: Record<string, string> = { DRAFT: "پیش‌نویس", PENDING_PAYMENT: "در انتظار پرداخت", PAID: "پرداخت‌شده", PROCESSING: "آماده‌سازی", SHIPPED: "ارسال‌شده", DELIVERED: "تحویل‌شده", CANCELLED: "لغوشده", REFUNDED: "بازپرداخت" };

export default async function AdminDashboard() {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const [products, activeProducts, customers, ordersCount, revenue, chartOrders, recentOrders, pendingReviews, pendingReceipts, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: { in: [...saleStatuses] } } }),
    prisma.order.aggregate({ where: { status: { in: [...saleStatuses] } }, _sum: { total: true } }),
    prisma.order.findMany({ where: { status: { in: [...saleStatuses] }, createdAt: { gte: since } }, select: { total: true, createdAt: true } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { user: true, _count: { select: { items: true } } } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.paymentReceipt.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "ACTIVE", stock: { lte: 5 } } })
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(since.getFullYear(), since.getMonth() + index, 1);
    return { key: `${date.getFullYear()}-${date.getMonth()}`, label: new Intl.DateTimeFormat("fa-IR", { month: "short" }).format(date), value: 0 };
  });
  chartOrders.forEach((order) => {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    const month = months.find((item) => item.key === key);
    if (month) month.value += order.total;
  });
  const maxMonth = Math.max(...months.map((month) => month.value), 1);
  const pendingTotal = pendingReviews + pendingReceipts + lowStock;

  return <main className="admin-page admin-dashboard">
    <header className="admin-page-header">
      <div><p className="admin-kicker">داشبورد فروشگاه</p><h1>صبح بخیر، آماده‌ای؟</h1><p>وضعیت BeautyOS و کارهایی که امروز به توجه نیاز دارند اینجاست.</p></div>
      <a href="/admin/products/new" className="primary-action">محصول جدید <span>＋</span></a>
    </header>

    <section className="admin-stat-grid" aria-label="آمار فروشگاه">
      <article><div><span>فروش کل</span><CurrencyCircleDollar size={20} /></div><strong>{formatMoney(revenue._sum.total ?? 0)}</strong><small>از سفارش‌های پرداخت‌شده</small></article>
      <article><div><span>سفارش موفق</span><ShoppingBag size={20} /></div><strong>{formatNumber(ordersCount)}</strong><small>پرداخت تا تحویل</small></article>
      <article><div><span>مشتریان</span><Users size={20} /></div><strong>{formatNumber(customers)}</strong><small>حساب مشتری ثبت‌شده</small></article>
      <article><div><span>محصول فعال</span><Package size={20} /></div><strong>{formatNumber(activeProducts)}</strong><small>از {formatNumber(products)} محصول</small></article>
    </section>

    <section className="admin-dashboard-grid">
      <article className="admin-dashboard-card admin-sales-chart">
        <header><div><span>روند فروش</span><small>۶ ماه اخیر</small></div><a href="/admin/reports">گزارش کامل <ArrowLeft size={14} /></a></header>
        <div className="admin-chart-value"><strong>{formatMoney(chartOrders.reduce((sum, order) => sum + order.total, 0))}</strong><span>فروش این بازه</span></div>
        <div className="admin-bars" aria-label="نمودار فروش شش ماه اخیر">
          {months.map((month) => <div key={month.key} title={`${month.label}: ${formatMoney(month.value)}`}><span style={{ height: `${Math.max((month.value / maxMonth) * 100, month.value ? 8 : 2)}%` }} /><small>{month.label}</small></div>)}
        </div>
      </article>
      <article className="admin-dashboard-card admin-attention-card">
        <header><div><span>نیازمند توجه</span><small>{formatNumber(pendingTotal)} مورد باز</small></div><Clock size={20} /></header>
        <a href="/admin/orders"><span className="attention-icon receipt"><CurrencyCircleDollar size={18} /></span><div><strong>رسیدهای پرداخت</strong><small>نیازمند بررسی و تأیید مدیر</small></div><b>{formatNumber(pendingReceipts)}</b></a>
        <a href="/admin/reviews"><span className="attention-icon review"><Star size={18} /></span><div><strong>نظرات جدید</strong><small>منتظر انتشار یا پاسخ</small></div><b>{formatNumber(pendingReviews)}</b></a>
        <a href="/admin/inventory"><span className="attention-icon stock"><Package size={18} /></span><div><strong>موجودی کم</strong><small>پنج عدد یا کمتر</small></div><b>{formatNumber(lowStock)}</b></a>
        {!pendingTotal ? <div className="admin-all-clear"><CheckCircle size={21} weight="fill" /><span>همه‌چیز مرتب است؛ مورد بازی باقی نمانده.</span></div> : null}
      </article>
    </section>

    <section className="admin-dashboard-card admin-recent-orders">
      <header><div><span>آخرین سفارش‌ها</span><small>جدیدترین فعالیت فروشگاه</small></div><a href="/admin/orders">مشاهده همه <ArrowLeft size={14} /></a></header>
      {recentOrders.length ? <div className="admin-recent-table"><div className="admin-recent-table-head"><span>شماره</span><span>مشتری</span><span>کالا</span><span>مبلغ</span><span>وضعیت</span><span>تاریخ</span></div>
        {recentOrders.map((order) => <a href="/admin/orders" key={order.id}><b>#{order.id.slice(-7)}</b><span>{order.user?.displayName || order.user?.phone || "مهمان"}</span><span>{formatNumber(order._count.items)}</span><strong>{formatMoney(order.total)}</strong><i className={`order-status ${order.status.toLowerCase()}`}>{statusLabels[order.status]}</i><time>{new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(order.createdAt)}</time></a>)}
      </div> : <div className="admin-empty"><ShoppingBag size={30} /><strong>هنوز سفارشی ثبت نشده است.</strong><p>پس از اولین خرید، خلاصه آن در این بخش دیده می‌شود.</p></div>}
    </section>
  </main>;
}
