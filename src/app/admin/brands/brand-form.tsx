import type { Brand } from "@prisma/client";

export function BrandForm({ action, brand, error }: { action: (formData: FormData) => void | Promise<void>; brand?: Brand; error?: string }) {
  return (
    <form action={action} className="admin-product-form compact-form">
      {error ? <div className="admin-alert error">{error}</div> : null}
      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۱</span><div><h2>اطلاعات برند</h2><p>نام برند در فیلترها و صفحه محصول نمایش داده می‌شود.</p></div></div>
        <div className="admin-form-grid">
          <label><span>نام برند *</span><input name="name" required defaultValue={brand?.name} placeholder="مثلاً Derma Safe" /></label>
          <label><span>اسلاگ انگلیسی *</span><input name="slug" required dir="ltr" defaultValue={brand?.slug} placeholder="derma-safe" /></label>
          <label><span>کشور سازنده</span><input name="country" defaultValue={brand?.country || ""} placeholder="Iran" /></label>
          <label className="field-wide"><span>معرفی کوتاه</span><textarea name="description" rows={4} defaultValue={brand?.description || ""} placeholder="داستان، تخصص یا ویژگی متمایز برند" /></label>
        </div>
      </section>
      <div className="admin-form-actions"><a href="/admin/brands" className="secondary-action">انصراف</a><button className="primary-action" type="submit">{brand ? "ذخیره برند" : "ایجاد برند"}</button></div>
    </form>
  );
}
