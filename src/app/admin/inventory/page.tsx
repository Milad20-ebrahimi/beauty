import { prisma } from "@/lib/prisma";
import { expireStaleOrders } from "@/lib/order-inventory";
import { adjustInventory } from "./actions";

export const dynamic = "force-dynamic";
const movementLabels: Record<string, string> = { ADJUSTMENT: "اصلاح دستی", RESERVATION: "رزرو سفارش", RELEASE: "آزادسازی", SALE: "فروش قطعی", RETURN: "بازگشت" };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const query = await searchParams;
  const expiredCount = await expireStaleOrders();
  const [products, movements] = await Promise.all([
    prisma.product.findMany({ include: { brand: true }, orderBy: [{ stock: "asc" }, { title: "asc" }] }),
    prisma.inventoryMovement.findMany({ include: { product: true }, orderBy: { createdAt: "desc" }, take: 30 })
  ]);
  const totalStock = products.reduce((sum, item) => sum + item.stock, 0);
  const totalReserved = products.reduce((sum, item) => sum + item.reservedStock, 0);
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-kicker">کنترل کالا</p><h1>انبار و موجودی</h1><p>موجودی کل، رزروشده و قابل‌فروش را ببین و هر تغییر دستی را با دلیل ثبت کن.</p></div></header>
    <section className="admin-stat-grid inventory-stats"><article><span>موجودی کل</span><strong>{totalStock}</strong><small>تعداد فیزیکی ثبت‌شده</small></article><article><span>رزروشده</span><strong>{totalReserved}</strong><small>سفارش‌های منتظر پرداخت</small></article><article><span>قابل‌فروش</span><strong>{totalStock - totalReserved}</strong><small>موجودی آزاد فعلی</small></article><article><span>هشدار کمبود</span><strong>{products.filter((item) => item.stock - item.reservedStock <= 5).length}</strong><small>محصول با ۵ عدد یا کمتر</small></article></section>
    <section className="admin-help-note"><strong>موجودی چگونه کار می‌کند؟</strong><p>ثبت سفارش فقط موجودی را رزرو می‌کند. تأیید رسید، فروش را قطعی و موجودی کل را کم می‌کند. لغو یا پایان مهلت ۲۴ ساعته، رزرو را آزاد می‌کند.</p></section>
    {expiredCount > 0 ? <div className="admin-alert success">{expiredCount} سفارش منقضی شد و موجودی آن‌ها آزاد شد.</div> : null}{query.updated ? <div className="admin-alert success">موجودی و دلیل تغییر ثبت شد.</div> : null}{query.error ? <div className="admin-alert error">{query.error === "reserved" ? "موجودی کل نمی‌تواند کمتر از مقدار رزروشده باشد." : "عدد موجودی و دلیل تغییر را درست وارد کن."}</div> : null}
    <section className="inventory-grid"><div className="inventory-products"><div className="admin-table-head"><span>وضعیت محصولات</span><small>موجودی قابل‌فروش = کل منهای رزروشده</small></div>{products.map((product) => { const available = product.stock - product.reservedStock; return <article key={product.id}><div><strong>{product.title}</strong><small>{product.brand.name}</small></div><dl><div><dt>کل</dt><dd>{product.stock}</dd></div><div><dt>رزرو</dt><dd>{product.reservedStock}</dd></div><div className={available <= 5 ? "low-stock" : ""}><dt>آزاد</dt><dd>{available}</dd></div></dl><form action={adjustInventory}><input type="hidden" name="productId" value={product.id} /><label>موجودی واقعی<input name="stock" type="number" min={product.reservedStock} defaultValue={product.stock} /></label><label>دلیل تغییر<input name="note" placeholder="مثلاً ورود محموله جدید" required /></label><button type="submit">ثبت</button></form></article>; })}</div>
      <aside className="inventory-history"><div className="admin-table-head"><span>آخرین تغییرات</span><small>۳۰ رویداد اخیر</small></div>{movements.length ? movements.map((movement) => <article key={movement.id}><div><strong>{movement.product.title}</strong><span className={`movement-type ${movement.type.toLowerCase()}`}>{movementLabels[movement.type]}</span></div><p>{movement.note || "بدون توضیح"}</p><footer><span>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(movement.createdAt)}</span><b>{movement.stockDelta ? `کل ${movement.stockDelta > 0 ? "+" : ""}${movement.stockDelta}` : `رزرو ${movement.reservedDelta > 0 ? "+" : ""}${movement.reservedDelta}`}</b></footer></article>) : <div className="admin-empty"><p>هنوز تغییری ثبت نشده است.</p></div>}</aside></section>
  </main>;
}
