import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const successfulStatuses: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const dayLabel = (date: Date) => new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(date);
const statusLabel: Record<OrderStatus, string> = { DRAFT: "پیش‌نویس", PENDING_PAYMENT: "منتظر پرداخت", PAID: "پرداخت‌شده", PROCESSING: "در حال آماده‌سازی", SHIPPED: "ارسال‌شده", DELIVERED: "تحویل‌شده", CANCELLED: "لغوشده", REFUNDED: "مرجوع‌شده" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const range = ["7", "30", "90"].includes(params.range || "") ? Number(params.range) : 30;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - range + 1);

  const [orders, pendingReceipts, activeProductsForStock, newCustomers, topItems] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: from } },
      select: { id: true, total: true, discount: true, shippingFee: true, status: true, createdAt: true, user: { select: { displayName: true, phone: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.paymentReceipt.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { id: true, title: true, stock: true, reservedStock: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: from } } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { in: successfulStatuses }, createdAt: { gte: from } } },
      _sum: { quantity: true },
      _count: { _all: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6
    })
  ]);

  const successfulOrders = orders.filter((order) => successfulStatuses.includes(order.status));
  const lowStockProducts = activeProductsForStock.filter((product) => product.stock - product.reservedStock <= 5).sort((a, b) => (a.stock - a.reservedStock) - (b.stock - b.reservedStock)).slice(0, 6);
  const revenue = successfulOrders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscount = successfulOrders.reduce((sum, order) => sum + order.discount, 0);
  const averageOrder = successfulOrders.length ? Math.round(revenue / successfulOrders.length) : 0;
  const waitingOrders = orders.filter((order) => order.status === "PENDING_PAYMENT").length;
  const activeOrders = orders.filter((order) => ["PAID", "PROCESSING"].includes(order.status)).length;
  const conversionBase = orders.filter((order) => order.status !== "DRAFT").length;
  const paidRate = conversionBase ? Math.round((successfulOrders.length / conversionBase) * 100) : 0;
  const productMap = new Map((await prisma.product.findMany({ where: { id: { in: topItems.map((item) => item.productId) } }, select: { id: true, title: true, stock: true } })).map((product) => [product.id, product]));

  const days = Array.from({ length: Math.min(range, 30) }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (Math.min(range, 30) - index - 1));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const value = successfulOrders.filter((order) => order.createdAt >= date && order.createdAt < next).reduce((sum, order) => sum + order.total, 0);
    return { date, value };
  });
  const maxDaily = Math.max(...days.map((day) => day.value), 1);

  return <main className="admin-page">
    <header className="admin-page-header"><div><p className="admin-kicker">تصمیم‌گیری با عدد واقعی</p><h1>گزارش فروش</h1><p>ببین فروشگاه چقدر فروخته، کدام کالاها محبوب‌ترند و چه کارهایی منتظر رسیدگی تو هستند.</p></div><a href="/admin/orders" className="secondary-action">مدیریت سفارش‌ها</a></header>
    <section className="admin-help-note"><strong>درآمد چگونه محاسبه شده؟</strong><p>فقط سفارش‌های پرداخت‌شده، در حال آماده‌سازی، ارسال‌شده و تحویل‌شده حساب شده‌اند. سفارش منتظر پرداخت، لغوشده و مرجوعی داخل درآمد نیست.</p></section>
    <nav className="report-range" aria-label="بازه گزارش"><span>نمایش:</span>{[7,30,90].map((day) => <a key={day} href={`/admin/reports?range=${day}`} className={range === day ? "active" : ""}>{money(day)} روز اخیر</a>)}</nav>

    <section className="report-kpis">
      <article className="primary"><span>فروش قطعی</span><strong>{money(revenue)} <small>تومان</small></strong><p>{money(successfulOrders.length)} سفارش موفق</p></article>
      <article><span>میانگین هر سفارش</span><strong>{money(averageOrder)} <small>تومان</small></strong><p>برای افزایش این عدد، فروش مکمل پیشنهاد بده.</p></article>
      <article><span>نرخ پرداخت سفارش</span><strong>{money(paidRate)}٪</strong><p>از سفارش‌های ثبت‌شده در این بازه</p></article>
      <article><span>مشتری جدید</span><strong>{money(newCustomers)}</strong><p>حساب مشتری ساخته‌شده</p></article>
    </section>

    <section className="report-actions"><div><span className={pendingReceipts ? "warning" : "ok"}>{money(pendingReceipts)}</span><p><strong>رسید منتظر بررسی</strong><small>تصویر پرداخت مشتری را تأیید یا رد کن.</small></p><a href="/admin/orders">بررسی رسیدها ←</a></div><div><span className={activeOrders ? "warning" : "ok"}>{money(activeOrders)}</span><p><strong>سفارش آماده‌نشده</strong><small>پرداخت شده اما هنوز ارسال نشده است.</small></p><a href="/admin/orders">رسیدگی ←</a></div><div><span className={lowStockProducts.length ? "danger" : "ok"}>{money(lowStockProducts.length)}</span><p><strong>هشدار موجودی</strong><small>محصول فعال با ۵ عدد یا کمتر موجودی.</small></p><a href="/admin/inventory">دیدن انبار ←</a></div><div><span className={waitingOrders ? "warning" : "ok"}>{money(waitingOrders)}</span><p><strong>منتظر پرداخت</strong><small>سفارش‌های پرداخت‌نشده این بازه.</small></p><a href="/admin/orders">مشاهده ←</a></div></section>

    <section className="report-grid">
      <article className="report-card sales-chart"><header><div><h2>روند فروش روزانه</h2><p>۳۰ روز آخرِ بازه انتخاب‌شده</p></div><strong>{money(totalDiscount)} تومان تخفیف</strong></header><div className="sales-bars">{days.map((day, index) => <div key={day.date.toISOString()} title={`${dayLabel(day.date)}: ${money(day.value)} تومان`}><span style={{ height: `${Math.max(day.value ? 8 : 2, (day.value / maxDaily) * 100)}%` }} /><small>{index % Math.max(1, Math.ceil(days.length / 7)) === 0 || index === days.length - 1 ? dayLabel(day.date) : ""}</small></div>)}</div>{revenue ? null : <p className="report-empty">هنوز فروش قطعی در این بازه ثبت نشده است.</p>}</article>
      <article className="report-card"><header><div><h2>محصولات پرفروش</h2><p>براساس تعداد کالای فروخته‌شده</p></div></header><div className="rank-list">{topItems.map((item, index) => { const product = productMap.get(item.productId); return <div key={item.productId}><b>{money(index + 1)}</b><p><strong>{product?.title || "محصول حذف‌شده"}</strong><small>موجودی فعلی: {money(product?.stock || 0)}</small></p><span>{money(item._sum.quantity || 0)} عدد</span></div>; })}{!topItems.length ? <p className="report-empty">پس از اولین فروش، رتبه محصولات اینجا نمایش داده می‌شود.</p> : null}</div></article>
    </section>

    <section className="report-grid lower">
      <article className="report-card"><header><div><h2>آخرین سفارش‌ها</h2><p>جدیدترین اتفاق‌های این بازه</p></div><a href="/admin/orders">همه سفارش‌ها</a></header><div className="recent-report-orders">{orders.slice(0,6).map((order) => <div key={order.id}><p><strong>#{order.id.slice(-6)}</strong><small>{order.user?.displayName || order.user?.phone || "مشتری مهمان"}</small></p><span className={`order-report-status status-${order.status.toLowerCase()}`}>{statusLabel[order.status]}</span><b>{money(order.total)} تومان</b></div>)}{!orders.length ? <p className="report-empty">در این بازه سفارشی ثبت نشده است.</p> : null}</div></article>
      <article className="report-card"><header><div><h2>کالاهای رو به اتمام</h2><p>قبل از ناموجودشدن برای خرید اقدام کن</p></div><a href="/admin/inventory">مدیریت انبار</a></header><div className="low-stock-list">{lowStockProducts.map((product) => <div key={product.id}><p><strong>{product.title}</strong><small>{money(product.reservedStock)} عدد رزروشده</small></p><b className={product.stock - product.reservedStock <= 0 ? "empty" : ""}>{money(Math.max(0, product.stock - product.reservedStock))} قابل فروش</b></div>)}{!lowStockProducts.length ? <p className="report-empty">عالی است؛ محصول فعال کم‌موجودی نداری.</p> : null}</div></article>
    </section>
  </main>;
}
