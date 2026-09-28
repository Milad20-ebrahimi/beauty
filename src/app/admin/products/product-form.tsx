import Image from "next/image";
import type { Brand, Category, Concern, Ingredient, Product, SkinType } from "@prisma/client";

type ProductWithRelations = Product & {
  media: { id: string; url: string; alt?: string | null }[];
  concerns: { concernId: string }[];
  ingredients: { ingredientId: string }[];
  skinSuitability: { skinType: SkinType; score: number; note: string | null }[];
};

const roles = [
  ["CLEANSER", "شوینده"], ["MOISTURIZER", "مرطوب‌کننده"], ["SUNSCREEN", "ضدآفتاب"],
  ["SERUM", "سرم"], ["TONER", "تونر"], ["MAKEUP", "آرایشی"], ["HAIRCARE", "مراقبت مو"],
  ["BODYCARE", "مراقبت بدن"], ["FRAGRANCE", "عطر"], ["OTHER", "سایر"]
];

const skinTypes = [
  ["OILY", "پوست چرب"], ["DRY", "پوست خشک"], ["COMBINATION", "پوست مختلط"],
  ["NORMAL", "پوست نرمال"], ["SENSITIVE", "پوست حساس"]
] as const;

export function ProductForm({
  action,
  product,
  brands,
  categories,
  concerns,
  ingredients,
  error
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: ProductWithRelations;
  brands: Brand[];
  categories: Category[];
  concerns: Concern[];
  ingredients: Ingredient[];
  error?: string;
}) {
  const selectedConcerns = new Set(product?.concerns.map((item) => item.concernId));
  const selectedIngredients = new Set(product?.ingredients.map((item) => item.ingredientId));
  const suitabilityByType = new Map(product?.skinSuitability.map((item) => [item.skinType, item]));

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
        <div className="admin-form-heading"><span>۴</span><div><h2>گالری و ویژگی‌ها</h2><p>تا ۶ تصویر JPG، PNG یا WebP؛ هر فایل حداکثر ۵ مگابایت.</p></div></div>
        {product?.media.length ? <div className="admin-media-gallery">
          {product.media.map((media, index) => <label key={media.id} className="admin-media-item">
            <input type="hidden" name="existingMedia" value={media.url} />
            <Image src={media.url} alt={media.alt || product.title} width={180} height={180} />
            <span>{index === 0 ? "تصویر اصلی" : `تصویر ${index + 1}`}</span>
            <em><input type="checkbox" name="removeMedia" value={media.url} /> حذف از گالری</em>
          </label>)}
        </div> : null}
        <label className="admin-upload-zone"><span>انتخاب تصاویر از کامپیوتر</span><input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple /><small>تصویر اول به‌عنوان تصویر اصلی محصول نمایش داده می‌شود.</small></label>
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

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۶</span><div><h2>ترکیبات کلیدی</h2><p>ترکیبات مؤثر و قابل توضیح محصول را انتخاب کن.</p></div></div>
        {ingredients.length ? <div className="admin-check-grid concerns">
          {ingredients.map((ingredient) => <label key={ingredient.id}><input type="checkbox" name="ingredients" value={ingredient.id} defaultChecked={selectedIngredients.has(ingredient.id)} /><span><strong>{ingredient.name}</strong><small>{ingredient.description || "بدون توضیح"}</small></span></label>)}
        </div> : <div className="admin-inline-empty">هنوز ترکیبی ثبت نشده است. <a href="/admin/ingredients/new">ساخت ترکیب جدید</a></div>}
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading"><span>۷</span><div><h2>سازگاری انواع پوست</h2><p>از ۲۰- برای نامناسب تا ۲۰+ برای بسیار مناسب امتیاز بده.</p></div></div>
        <div className="skin-score-editor">
          {skinTypes.map(([value, label]) => {
            const suitability = suitabilityByType.get(value);
            return <div key={value} className="skin-score-row">
              <strong>{label}</strong>
              <label><span>امتیاز</span><input type="number" name={`skinScore_${value}`} min="-20" max="20" defaultValue={suitability?.score ?? ""} placeholder="-20 تا 20" /></label>
              <label><span>توضیح یا هشدار</span><input name={`skinNote_${value}`} defaultValue={suitability?.note || ""} placeholder="چرا مناسب یا نامناسب است؟" /></label>
            </div>;
          })}
        </div>
      </section>

      <div className="admin-form-actions"><a href="/admin/products" className="secondary-action">انصراف</a><button type="submit" className="primary-action">{product ? "ذخیره تغییرات" : "ایجاد محصول"}</button></div>
    </form>
  );
}
