import { prisma } from "@/lib/prisma";
import { deleteIngredient } from "./actions";

export const dynamic = "force-dynamic";

export default async function IngredientsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const [{ success, error }, ingredients] = await Promise.all([
    searchParams,
    prisma.ingredient.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } })
  ]);
  return <main className="admin-page">
    <header className="admin-page-header"><div><p className="admin-kicker">دانش محصول</p><h1>ترکیبات</h1><p>کتابخانه ترکیبات کلیدی محصولات و توضیح قابل فهم آن‌ها.</p></div><a href="/admin/ingredients/new" className="primary-action">+ ترکیب جدید</a></header>
    {success ? <div className="admin-alert success">{success === "created" ? "ترکیب ایجاد شد." : success === "updated" ? "ترکیب به‌روزرسانی شد." : "ترکیب حذف شد."}</div> : null}
    {error ? <div className="admin-alert error">{error}</div> : null}
    <section className="admin-entity-grid">
      {ingredients.map((ingredient) => <article key={ingredient.id} className="admin-entity-card ingredient-card">
        <div className="entity-monogram">{ingredient.name.charAt(0)}</div>
        <div className="entity-main"><strong>{ingredient.name}</strong><span dir="ltr">{ingredient.slug}</span><p>{ingredient.description || "توضیحی برای این ترکیب ثبت نشده است."}</p></div>
        <div className="entity-meta"><span>{ingredient._count.products} محصول مرتبط</span></div>
        <div className="entity-actions"><a href={`/admin/ingredients/${ingredient.id}/edit`}>ویرایش</a>{ingredient._count.products === 0 ? <form action={deleteIngredient}><input type="hidden" name="id" value={ingredient.id} /><button type="submit">حذف</button></form> : <span>حذف غیرفعال</span>}</div>
      </article>)}
      {!ingredients.length ? <div className="admin-empty"><strong>ترکیبی ثبت نشده است.</strong><a href="/admin/ingredients/new" className="primary-action">ساخت اولین ترکیب</a></div> : null}
    </section>
  </main>;
}
