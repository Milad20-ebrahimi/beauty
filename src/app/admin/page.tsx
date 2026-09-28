import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, activeProducts, brands, categories, ingredients, reviews, profiles, routines] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.ingredient.count(),
    prisma.review.count(),
    prisma.beautyProfile.count(),
    prisma.routine.count()
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
        <div><p className="admin-kicker">این پنل چطور کار می‌کند؟</p><h2>مسیر درست آماده‌سازی فروشگاه</h2><p>این چهار قدم را به‌ترتیب انجام بده تا پیشنهاد محصول و روتین هوشمند درست کار کنند.</p></div>
        <a href="/routine" className="secondary-action">دیدن خروجی روتین‌ساز</a>
      </section>

      <section className="admin-guide-grid" aria-label="راهنمای راه‌اندازی فروشگاه">
        <article><span>۱</span><div><h3>برند و دسته‌بندی</h3><p>اول سازنده و نوع محصول را بساز؛ محصول بدون این دو قابل ثبت نیست.</p><small>{brands} برند · {categories} دسته</small></div><a href="/admin/brands">شروع ←</a></article>
        <article><span>۲</span><div><h3>ترکیبات</h3><p>مواد مؤثره را ثبت کن تا دلیل پیشنهادها برای مشتری قابل توضیح باشد.</p><small>{ingredients} ترکیب ثبت‌شده</small></div><a href="/admin/ingredients">مدیریت ←</a></article>
        <article><span>۳</span><div><h3>محصول کامل</h3><p>تصویر، قیمت، نقش محصول، دغدغه و امتیاز انواع پوست را وارد کن.</p><small>{activeProducts} محصول آماده نمایش</small></div><a href="/admin/products">محصولات ←</a></article>
        <article><span>۴</span><div><h3>خروجی هوشمند</h3><p>محصول فعال وارد پیشنهادها و روتین صبح و شب مشتری می‌شود.</p><small>{routines} روتین ذخیره‌شده</small></div><a href="/routine">بررسی ←</a></article>
      </section>

      <section className="admin-help-note"><strong>قانون ساده:</strong><p>برای اینکه محصول در روتین‌ساز دیده شود، وضعیت آن باید «فعال» و نقش آن یکی از شوینده، سرم، مرطوب‌کننده یا ضدآفتاب باشد.</p></section>
    </main>
  );
}
