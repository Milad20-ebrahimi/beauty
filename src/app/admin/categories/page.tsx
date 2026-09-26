import { prisma } from "@/lib/prisma";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ success, error }, categories] = await Promise.all([
    searchParams,
    prisma.category.findMany({ include: { parent: true, _count: { select: { products: true, children: true } } }, orderBy: [{ parentId: "asc" }, { title: "asc" }] })
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-kicker">ساختار کاتالوگ</p><h1>دسته‌بندی‌ها</h1><p>ساختار اصلی و زیردسته‌های محصولات را مدیریت کن.</p></div><a href="/admin/categories/new" className="primary-action">+ دسته جدید</a></header>
      {success ? <div className="admin-alert success">{success === "created" ? "دسته‌بندی ایجاد شد." : success === "updated" ? "دسته‌بندی به‌روزرسانی شد." : "دسته‌بندی حذف شد."}</div> : null}
      {error ? <div className="admin-alert error">{error}</div> : null}
      <div className="admin-category-list">
        {categories.map((category) => {
          const canDelete = category._count.products === 0 && category._count.children === 0;
          return <article key={category.id} className="admin-category-row">
            <div className="category-level">{category.parent ? "زیر" : "اصلی"}</div>
            <div className="entity-main"><strong>{category.title}</strong><span dir="ltr">{category.slug}</span></div>
            <div className="category-parent"><small>والد</small><span>{category.parent?.title || "دسته اصلی"}</span></div>
            <div className="entity-meta"><span>{category._count.products} محصول</span><span>{category._count.children} زیردسته</span></div>
            <div className="entity-actions"><a href={`/admin/categories/${category.id}/edit`}>ویرایش</a>{canDelete ? <form action={deleteCategory}><input type="hidden" name="id" value={category.id} /><button type="submit">حذف</button></form> : <span title="دسته خالی نیست">حذف غیرفعال</span>}</div>
          </article>;
        })}
        {!categories.length ? <div className="admin-empty"><strong>دسته‌بندی‌ای ثبت نشده است.</strong><a href="/admin/categories/new" className="primary-action">ساخت اولین دسته</a></div> : null}
      </div>
    </main>
  );
}
