import type { Brand, Category, Concern, Product } from "@prisma/client";

type ProductWithRelations = Product & {
  media: { url: string }[];
  concerns: { concernId: string }[];
};

const roles = [
  ["CLEANSER", "شوینده"], ["MOISTURIZER", "مرطوب‌کننده"], ["SUNSCREEN", "ضدآفتاب"],
  ["SERUM", "سرم"], ["TONER", "تونر"], ["MAKEUP", "آرایشی"], ["HAIRCARE", "مراقبت مو"],
  ["BODYCARE", "مراقبت بدن"], ["FRAGRANCE", "عطر"], ["OTHER", "سایر"]
];

export function ProductForm({
  action,
  product,
  brands,
  categories,
  concerns,
  error
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: ProductWithRelations;
  brands: Brand[];
  categories: Category[];
  concerns: Concern[];
  error?: string;
}) {
  const selectedConcerns = new Set(product?.concerns.map((item) => item.concernId));

  return (
    <form action={action} className="admin-product-form">
      {error ? <div className="admin-alert error">{error}</div> : null}

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۱</span><div><h2>اطلاعات اصلی</h2><p>نام و توضیحی که کاربر در فروشگاه می‌بیند.</p></div></div>
        <div className="admin-form-grid">
          <label className="field-wide"><span>عنوان محصول *</span><input name="title" required defaultValue={product?.title} placeholder="مثلاً ژل شست‌وشوی ملایم" /></label>
          <label><span>اسلاگ انگلیسی *</span><input name="slug" required dir="ltr" defaultValue={product?.slug} placeholder="gentle-face-cleanser" /></label>
          <label><span>زیرعنوان</span><input name="subtitle" defaultValue={product?.subtitle || ""} placeholder="مناسب پوست خشک و حساس" /></label>
          <label className="field-wide"><span>توضیحات</span><textarea name="description" rows={4} defaultValue={product?.description || ""} placeholder="مزیت اصلی، بافت و کاربرد محصول را کوتاه و شفاف بنویس." /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۲</span><div><h2>دسته‌بندی و انتشار</h2><p>جایگاه محصول در کاتالوگ و وضعیت نمایش آن.</p></div></div>
        <div className="admin-form-grid">
          <label><span>برند *</span><select name="brandId" required defaultValue={product?.brandId || ""}><option value="" disabled>انتخاب برند</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
          <label><span>دسته‌بندی *</span><select name="categoryId" required defaultValue={product?.categoryId || ""}><option value="" disabled>انتخاب دسته</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
          <label><span>نقش در روتین</span><select name="role" defaultValue={product?.role || "OTHER"}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>وضعیت</span><select name="status" defaultValue={product?.status || "DRAFT"}><option value="DRAFT">پیش‌نویس</option><option value="ACTIVE">فعال و قابل نمایش</option><option value="ARCHIVED">آرشیو</option></select></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۳</span><div><h2>قیمت و موجودی</h2><p>مبالغ به تومان هستند و موجودی منفی پذیرفته نمی‌شود.</p></div></div>
        <div className="admin-form-grid three">
          <label><span>قیمت فروش *</span><input name="price" type="number" min="1" required defaultValue={product?.price || ""} /></label>
          <label><span>قیمت قبل از تخفیف</span><input name="compareAtPrice" type="number" min="0" defaultValue={product?.compareAtPrice || ""} /></label>
          <label><span>موجودی</span><input name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} /></label>
          <label><span>رده بودجه</span><select name="budgetTier" defaultValue={product?.budgetTier || "BALANCED"}><option value="ECONOMY">اقتصادی</option><option value="BALANCED">متعادل</option><option value="PREMIUM">پرمیوم</option></select></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۴</span><div><h2>تصویر و ویژگی‌ها</h2><p>فعلاً آدرس تصویر را وارد کن؛ آپلود مستقیم در مرحله رسانه اضافه می‌شود.</p></div></div>
        <label className="field-block"><span>آدرس تصویر</span><input name="imageUrl" dir="ltr" defaultValue={product?.media[0]?.url || ""} placeholder="/products/product-name.webp" /></label>
        <div className="admin-check-grid">
          <label><input type="checkbox" name="fragranceFree" defaultChecked={product?.fragranceFree === true} /> بدون عطر</label>
          <label><input type="checkbox" name="alcoholFree" defaultChecked={product?.alcoholFree === true} /> بدون الکل</label>
          <label><input type="checkbox" name="suitableForSensitive" defaultChecked={product?.suitableForSensitive === true} /> مناسب پوست حساس</label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۵</span><div><h2>دغدغه‌های مرتبط</h2><p>این موارد مستقیماً روی Match Score کاربران اثر می‌گذارند.</p></div></div>
        <div className="admin-check-grid concerns">
          {concerns.map((concern) => <label key={concern.id}><input type="checkbox" name="concerns" value={concern.slug} defaultChecked={selectedConcerns.has(concern.id)} /><span><strong>{concern.title}</strong><small>{concern.description}</small></span></label>)}
        </div>
      </section>

      <div className="admin-form-actions"><a href="/admin/products" className="secondary-action">انصراف</a><button type="submit" className="primary-action">{product ? "ذخیره تغییرات" : "ایجاد محصول"}</button></div>
    </form>
  );
}
