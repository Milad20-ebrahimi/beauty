import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { addToCart } from "@/app/cart/actions";
import { toggleFavorite, toggleCompare } from "@/app/products/product-actions";

export const dynamic = "force-dynamic";
const formatPrice = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireCustomer();
  const query = await searchParams;
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, include: { product: { include: { brand: true, category: true, media: { take: 1, orderBy: { sortOrder: "asc" } } } } }, orderBy: { createdAt: "desc" } });
  return <main className="home-shell favorites-page"><section className="compact-hero results-header"><div className="hero-content"><p className="eyebrow">لیست شخصی من</p><h1>محصولات موردعلاقه</h1><p className="hero-copy">محصول‌هایی که برای بعد نگه داشته‌ای اینجا هستند؛ آن‌ها را مقایسه کن یا مستقیم به سبد بفرست.</p></div></section>
    {query.favoriteRemoved ? <div className="cart-message">محصول از علاقه‌مندی‌ها حذف شد.</div> : null}{query.compareAdded ? <div className="cart-message success">محصول به مقایسه اضافه شد.</div> : null}{query.compareError ? <div className="cart-message error">حداکثر ۴ محصول را می‌توانی هم‌زمان مقایسه کنی.</div> : null}
    {favorites.length ? <><div className="favorite-toolbar"><span>{formatPrice(favorites.length)} محصول ذخیره‌شده</span><a href="/compare">مشاهده مقایسه محصولات ←</a></div><section className="favorite-grid">{favorites.map(({ product }) => { const image = product.media[0]; const available = Math.max(0, product.stock - product.reservedStock); return <article key={product.id}><a href={`/products/${product.slug}`} className="favorite-image">{image ? <Image src={image.url} alt={image.alt || product.title} width={360} height={360} /> : <span>بدون تصویر</span>}</a><div><p>{product.brand.name} · {product.category.title}</p><h2><a href={`/products/${product.slug}`}>{product.title}</a></h2><strong>{formatPrice(product.price)} تومان</strong><div className="favorite-actions"><form action={addToCart}><input type="hidden" name="productId" value={product.id} /><button disabled={!available} className="primary-action">{available ? "افزودن به سبد" : "ناموجود"}</button></form><form action={toggleCompare}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value="/account/favorites" /><button>افزودن به مقایسه</button></form><form action={toggleFavorite}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value="/account/favorites" /><button className="remove">حذف</button></form></div></div></article>; })}</section></> : <section className="empty-state"><h2>هنوز محصولی ذخیره نکرده‌ای.</h2><p>در فروشگاه روی دکمه قلب بزن تا محصول برای بعد اینجا بماند.</p><a href="/products" className="primary-action">رفتن به فروشگاه</a></section>}
  </main>;
}
