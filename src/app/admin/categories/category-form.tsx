import type { Category } from "@prisma/client";

export function CategoryForm({ action, category, parents, error }: { action: (formData: FormData) => void | Promise<void>; category?: Category; parents: Category[]; error?: string }) {
  return (
    <form action={action} className="admin-product-form compact-form">
      {error ? <div className="admin-alert error">{error}</div> : null}
      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۱</span><div><h2>اطلاعات دسته‌بندی</h2><p>برای دسته اصلی، فیلد والد را خالی بگذار.</p></div></div>
        <div className="admin-form-grid">
          <label><span>عنوان دسته *</span><input name="title" required defaultValue={category?.title} placeholder="مثلاً مراقبت پوست" /></label>
          <label><span>اسلاگ انگلیسی *</span><input name="slug" required dir="ltr" defaultValue={category?.slug} placeholder="skin-care" /></label>
          <label className="field-wide"><span>دسته والد</span><select name="parentId" defaultValue={category?.parentId || ""}><option value="">بدون والد؛ دسته اصلی</option>{parents.filter((item) => item.id !== category?.id).map((parent) => <option key={parent.id} value={parent.id}>{parent.title}</option>)}</select></label>
        </div>
      </section>
      <div className="admin-form-actions"><a href="/admin/categories" className="secondary-action">انصراف</a><button className="primary-action" type="submit">{category ? "ذخیره دسته" : "ایجاد دسته"}</button></div>
    </form>
  );
}
