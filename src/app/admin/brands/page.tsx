import { prisma } from "@/lib/prisma";
import { deleteBrand } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ success, error }, brands] = await Promise.all([
    searchParams,
    prisma.brand.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } })
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-header"><div><p className="admin-kicker">ساختار کاتالوگ</p><h1>برندها</h1><p>برندهای قابل انتخاب هنگام ساخت محصول را مدیریت کن.</p></div><a href="/admin/brands/new" className="primary-action">+ برند جدید</a></header>
      {success ? <div className="admin-alert success">{success === "created" ? "برند ایجاد شد." : success === "updated" ? "برند به‌روزرسانی شد." : "برند حذف شد."}</div> : null}
      {error ? <div className="admin-alert error">{error}</div> : null}
      <section className="admin-entity-grid">
        {brands.map((brand) => (
          <article key={brand.id} className="admin-entity-card">
            <div className="entity-monogram">{brand.name.charAt(0).toUpperCase()}</div>
            <div className="entity-main"><strong>{brand.name}</strong><span dir="ltr">{brand.slug}</span><p>{brand.description || "توضیحی برای این برند ثبت نشده است."}</p></div>
            <div className="entity-meta"><span>{brand._count.products} محصول</span>{brand.country ? <span>{brand.country}</span> : null}</div>
            <div className="entity-actions"><a href={`/admin/brands/${brand.id}/edit`}>ویرایش</a>{brand._count.products === 0 ? <form action={deleteBrand}><input type="hidden" name="id" value={brand.id} /><button type="submit">حذف</button></form> : <span title="برند دارای محصول است">حذف غیرفعال</span>}</div>
          </article>
        ))}
        {!brands.length ? <div className="admin-empty"><strong>برندی ثبت نشده است.</strong><a href="/admin/brands/new" className="primary-action">ساخت اولین برند</a></div> : null}
      </section>
    </main>
  );
}
