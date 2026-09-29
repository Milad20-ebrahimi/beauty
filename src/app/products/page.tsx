import { Prisma, SkinType } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCustomerUser } from "@/lib/auth";
import { ProductCard } from "@/app/product-card";
import { COMPARE_COOKIE } from "@/lib/compare";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 15;
const formatPrice = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const skinOptions: Array<[SkinType, string]> = [["OILY", "چرب"], ["DRY", "خشک"], ["COMBINATION", "مختلط"], ["NORMAL", "نرمال"], ["SENSITIVE", "حساس"]];

type Query = { q?: string; brand?: string; category?: string; skin?: string; min?: string; max?: string; stock?: string; sort?: string; page?: string; favoriteAdded?: string; favoriteRemoved?: string; compareAdded?: string; compareRemoved?: string; compareError?: string };
const number = (value?: string) => Math.max(0, Math.round(Number(value) || 0));

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const customer = await getCustomerUser();
  const compareIds = new Set(((await cookies()).get(COMPARE_COOKIE)?.value || "").split(",").filter(Boolean));
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

  const [products, total, brands, categories, favorites] = await Promise.all([
    prisma.product.findMany({ where, include: { brand: true, category: true, media: { take: 2, orderBy: { sortOrder: "asc" } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    prisma.brand.findMany({ where: { products: { some: { status: "ACTIVE" } } }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { products: { some: { status: "ACTIVE" } } }, orderBy: { title: "asc" } }),
    customer ? prisma.favorite.findMany({ where: { userId: customer.id }, select: { productId: true } }) : []
  ]);
  const favoriteIds = new Set(favorites.map((item) => item.productId));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (target: number) => { const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value) as string[][]); params.set("page", String(target)); return `/products?${params}`; };
  const activeFilters = Boolean(query.q || query.brand || query.category || skin || minPrice || maxPrice || query.stock);
  const currentParams = new URLSearchParams(Object.entries(query).filter(([, value]) => value) as string[][]).toString();
  const returnTo = `/products${currentParams ? `?${currentParams}` : ""}`;

  return <main className="home-shell catalog-page">
    <section className="compact-hero catalog-hero"><div className="hero-content"><p className="eyebrow">فروشگاه BeautyOS</p><h1>محصول مناسب خودت را پیدا کن.</h1><p className="hero-copy">بین محصولات جست‌وجو کن یا با نوع پوست، برند، دسته و بودجه انتخاب‌ها را محدود کن.</p></div><div className="catalog-count"><strong>{formatPrice(total)}</strong><span>محصول پیدا شد</span></div></section>
    {query.favoriteAdded ? <div className="cart-message success">محصول در علاقه‌مندی‌های حساب تو ذخیره شد.</div> : null}{query.favoriteRemoved ? <div className="cart-message">محصول از علاقه‌مندی‌ها حذف شد.</div> : null}{query.compareAdded ? <div className="cart-message success">محصول به مقایسه اضافه شد. <a href="/compare">مشاهده مقایسه</a></div> : null}{query.compareRemoved ? <div className="cart-message">محصول از مقایسه حذف شد.</div> : null}{query.compareError ? <div className="cart-message error">حداکثر ۴ محصول را می‌توانی مقایسه کنی.</div> : null}
    <div className="catalog-layout"><aside className="catalog-filters"><div><strong>فیلتر محصولات</strong>{activeFilters ? <a href="/products">پاک‌کردن همه</a> : null}</div><form method="get"><label>جست‌وجو<input name="q" defaultValue={query.q} placeholder="نام محصول یا برند" /></label><label>دسته‌بندی<select name="category" defaultValue={query.category || ""}><option value="">همه دسته‌ها</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label>برند<select name="brand" defaultValue={query.brand || ""}><option value="">همه برندها</option>{brands.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>نوع پوست<select name="skin" defaultValue={skin || ""}><option value="">همه پوست‌ها</option>{skinOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="catalog-price-fields"><label>حداقل قیمت<input name="min" type="number" min="0" defaultValue={minPrice || ""} placeholder="تومان" /></label><label>حداکثر قیمت<input name="max" type="number" min="0" defaultValue={maxPrice || ""} placeholder="تومان" /></label></div><label>مرتب‌سازی<select name="sort" defaultValue={query.sort || "newest"}><option value="newest">جدیدترین</option><option value="oldest">قدیمی‌تر</option><option value="price-asc">ارزان‌ترین</option><option value="price-desc">گران‌ترین</option></select></label><label className="catalog-check"><input name="stock" value="1" type="checkbox" defaultChecked={query.stock === "1"} /> فقط محصولات موجود</label><button type="submit" className="primary-action">نمایش نتیجه‌ها</button></form></aside>
      <section className="catalog-results"><div className="catalog-result-head"><div><strong>{activeFilters ? "نتیجه فیلترها" : "همه محصولات"}</strong><span>صفحه {formatPrice(page)} از {formatPrice(totalPages)}</span></div><div><a href="/compare">مقایسه ({formatPrice(compareIds.size)})</a><a href="/passport">پیشنهاد شخصی ←</a></div></div>{products.length ? <div className="catalog-grid">{products.map((product) => <ProductCard key={product.id} product={product} initialFavorite={favoriteIds.has(product.id)} returnTo={returnTo} />)}</div> : <div className="empty-state"><h2>محصولی با این فیلترها پیدا نشد.</h2><p>فیلتر قیمت یا نوع پوست را تغییر بده و دوباره امتحان کن.</p><a href="/products" className="primary-action">نمایش همه محصولات</a></div>}
        {totalPages > 1 ? <nav className="catalog-pagination" aria-label="صفحه‌بندی محصولات">{page > 1 ? <a href={pageUrl(page - 1)}>صفحه قبل</a> : <span /> }<strong>{formatPrice(page)} / {formatPrice(totalPages)}</strong>{page < totalPages ? <a href={pageUrl(page + 1)}>صفحه بعد</a> : <span />}</nav> : null}
      </section></div>
  </main>;
}
