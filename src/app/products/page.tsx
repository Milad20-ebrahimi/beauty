import Image from "next/image";
import { Prisma, SkinType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/cart/actions";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;
const formatPrice = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const skinOptions: Array<[SkinType, string]> = [["OILY", "چرب"], ["DRY", "خشک"], ["COMBINATION", "مختلط"], ["NORMAL", "نرمال"], ["SENSITIVE", "حساس"]];

type Query = { q?: string; brand?: string; category?: string; skin?: string; min?: string; max?: string; stock?: string; sort?: string; page?: string };
const number = (value?: string) => Math.max(0, Math.round(Number(value) || 0));

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const page = Math.max(1, number(query.page) || 1);
  const minPrice = number(query.min);
  const maxPrice = number(query.max);
  const skin = Object.values(SkinType).includes(query.skin as SkinType) ? query.skin as SkinType : null;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(query.q ? { OR: [{ title: { contains: query.q, mode: "insensitive" } }, { subtitle: { contains: query.q, mode: "insensitive" } }, { brand: { name: { contains: query.q, mode: "insensitive" } } }] } : {}),
    ...(query.brand ? { brandId: query.brand } : {}),
    ...(query.category ? { categoryId: query.category } : {}),
    ...(minPrice || maxPrice ? { price: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } } : {}),
    ...(query.stock === "1" ? { stock: { gt: 0 } } : {}),
    ...(skin ? { skinSuitability: { some: { skinType: skin, score: { gt: 0 } } } } : {})
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput = query.sort === "price-asc" ? { price: "asc" } : query.sort === "price-desc" ? { price: "desc" } : query.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [products, total, brands, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { brand: true, category: true, media: { take: 1, orderBy: { sortOrder: "asc" } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    prisma.brand.findMany({ where: { products: { some: { status: "ACTIVE" } } }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { products: { some: { status: "ACTIVE" } } }, orderBy: { title: "asc" } })
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (target: number) => { const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value) as string[][]); params.set("page", String(target)); return `/products?${params}`; };
  const activeFilters = Boolean(query.q || query.brand || query.category || skin || minPrice || maxPrice || query.stock);

  return <main className="home-shell catalog-page">
    <section className="compact-hero catalog-hero"><div className="hero-content"><p className="eyebrow">فروشگاه BeautyOS</p><h1>محصول مناسب خودت را پیدا کن.</h1><p className="hero-copy">بین محصولات جست‌وجو کن یا با نوع پوست، برند، دسته و بودجه انتخاب‌ها را محدود کن.</p></div><div className="catalog-count"><strong>{formatPrice(total)}</strong><span>محصول پیدا شد</span></div></section>
    <div className="catalog-layout"><aside className="catalog-filters"><div><strong>فیلتر محصولات</strong>{activeFilters ? <a href="/products">پاک‌کردن همه</a> : null}</div><form method="get"><label>جست‌وجو<input name="q" defaultValue={query.q} placeholder="نام محصول یا برند" /></label><label>دسته‌بندی<select name="category" defaultValue={query.category || ""}><option value="">همه دسته‌ها</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>برند<select name="brand" defaultValue={query.brand || ""}><option value="">همه برندها</option>{brands.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>نوع پوست<select name="skin" defaultValue={skin || ""}><option value="">همه پوست‌ها</option>{skinOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="catalog-price-fields"><label>حداقل قیمت<input name="min" type="number" min="0" defaultValue={minPrice || ""} placeholder="تومان" /></label><label>حداکثر قیمت<input name="max" type="number" min="0" defaultValue={maxPrice || ""} placeholder="تومان" /></label></div><label>مرتب‌سازی<select name="sort" defaultValue={query.sort || "newest"}><option value="newest">جدیدترین</option><option value="oldest">قدیمی‌تر</option><option value="price-asc">ارزان‌ترین</option><option value="price-desc">گران‌ترین</option></select></label><label className="catalog-check"><input name="stock" value="1" type="checkbox" defaultChecked={query.stock === "1"} /> فقط محصولات موجود</label><button type="submit" className="primary-action">نمایش نتیجه‌ها</button></form></aside>
      <section className="catalog-results"><div className="catalog-result-head"><div><strong>{activeFilters ? "نتیجه فیلترها" : "همه محصولات"}</strong><span>صفحه {formatPrice(page)} از {formatPrice(totalPages)}</span></div><a href="/passport">پیشنهاد شخصی می‌خواهم ←</a></div>{products.length ? <div className="catalog-grid">{products.map((product) => { const image = product.media[0]; const available = Math.max(0, product.stock - product.reservedStock); const rating = product.reviews.length ? product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length : 0; return <article className="catalog-card" key={product.id}><a href={`/products/${product.slug}`} className="catalog-card-image">{image ? <Image src={image.url} alt={image.alt || product.title} width={420} height={420} /> : <span>تصویر به‌زودی</span>}{available ? <b>موجود</b> : <b className="sold-out">ناموجود</b>}</a><div className="catalog-card-body"><p>{product.brand.name} · {product.category.title}</p><h2><a href={`/products/${product.slug}`}>{product.title}</a></h2>{product.subtitle ? <small>{product.subtitle}</small> : null}<div className="catalog-rating"><span>{rating ? `★ ${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(rating)}` : "بدون نظر"}</span><span>{product.reviews.length ? `${formatPrice(product.reviews.length)} تجربه` : "جدید"}</span></div><footer><strong>{formatPrice(product.price)} <small>تومان</small></strong><form action={addToCart}><input type="hidden" name="productId" value={product.id} /><button disabled={!available} aria-label={`افزودن ${product.title} به سبد`}>{available ? "+ سبد" : "ناموجود"}</button></form></footer></div></article>; })}</div> : <div className="empty-state"><h2>محصولی با این فیلترها پیدا نشد.</h2><p>فیلتر قیمت یا نوع پوست را تغییر بده و دوباره امتحان کن.</p><a href="/products" className="primary-action">نمایش همه محصولات</a></div>}
        {totalPages > 1 ? <nav className="catalog-pagination" aria-label="صفحه‌بندی محصولات">{page > 1 ? <a href={pageUrl(page - 1)}>صفحه قبل</a> : <span /> }<strong>{formatPrice(page)} / {formatPrice(totalPages)}</strong>{page < totalPages ? <a href={pageUrl(page + 1)}>صفحه بعد</a> : <span />}</nav> : null}
      </section></div>
  </main>;
}
