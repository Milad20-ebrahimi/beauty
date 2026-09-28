import type { Ingredient } from "@prisma/client";

export function IngredientForm({ action, ingredient, error }: { action: (formData: FormData) => void | Promise<void>; ingredient?: Ingredient; error?: string }) {
  return <form action={action} className="admin-product-form compact-form">
    {error ? <div className="admin-alert error">{error}</div> : null}
    <section className="admin-form-section">
      <div className="admin-form-heading"><span>۱</span><div><h2>اطلاعات ترکیب</h2><p>توضیح را ساده و قابل فهم برای مشتری بنویس، نه صرفاً علمی.</p></div></div>
      <div className="admin-form-grid">
        <label><span>نام ترکیب *</span><input name="name" required defaultValue={ingredient?.name} placeholder="مثلاً نیاسینامید" /></label>
        <label><span>اسلاگ انگلیسی *</span><input name="slug" required dir="ltr" defaultValue={ingredient?.slug} placeholder="niacinamide" /></label>
        <label className="field-wide"><span>کاربرد و توضیح</span><textarea name="description" rows={5} defaultValue={ingredient?.description || ""} placeholder="این ترکیب چه کمکی به پوست می‌کند و چه نکته‌ای دارد؟" /></label>
      </div>
    </section>
    <div className="admin-form-actions"><a href="/admin/ingredients" className="secondary-action">انصراف</a><button className="primary-action" type="submit">{ingredient ? "ذخیره ترکیب" : "ایجاد ترکیب"}</button></div>
  </form>;
}
