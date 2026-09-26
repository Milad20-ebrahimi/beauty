import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, activeProducts, brands, reviews, profiles] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.brand.count(),
    prisma.review.count(),
    prisma.beautyProfile.count()
  ]);

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">داشبورد</p><h1>نمای کلی فروشگاه</h1><p>وضعیت محتوای BeautyOS را از یک‌جا ببین و مدیریت کن.</p></div>
        <a href="/admin/products/new" className="primary-action">افزودن محصول</a>
      </header>

      <section className="admin-stat-grid" aria-label="آمار فروشگاه">
        <article><span>کل محصولات</span><strong>{products}</strong><small>{activeProducts} محصول فعال</small></article>
        <article><span>برندها</span><strong>{brands}</strong><small>برند ثبت‌شده</small></article>
        <article><span>تجربه کاربران</span><strong>{reviews}</strong><small>نظر و تجربه محصول</small></article>
        <article><span>پاسپورت‌ها</span><strong>{profiles}</strong><small>پروفایل زیبایی ساخته‌شده</small></article>
      </section>

      <section className="admin-next-block">
        <div><p className="admin-kicker">شروع سریع</p><h2>کاتالوگ محصولات</h2><p>محصول جدید اضافه کن یا اطلاعات، تصویر، قیمت و وضعیت محصولات فعلی را ویرایش کن.</p></div>
        <a href="/admin/products" className="secondary-action">مدیریت محصولات</a>
      </section>
    </main>
  );
}
