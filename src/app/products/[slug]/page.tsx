import Image from "next/image";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore, getSimilarReviewSignal, type MatchProfile } from "@/features/recommendation/match-score";
import { addToCart } from "@/app/cart/actions";
import { getCustomerUser } from "@/lib/auth";
import { toggleCompare, toggleFavorite } from "../product-actions";
import { COMPARE_COOKIE } from "@/lib/compare";
import { getSeoSettings } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "ACTIVE" }, include: { brand: true, media: { take: 1, orderBy: { sortOrder: "asc" } } } });
  if (!product) return { title: "محصول پیدا نشد" };
  const description = (product.description || product.subtitle || `خرید ${product.title} از برند ${product.brand.name}`).slice(0, 160);
  return { title: product.title, description, alternates: { canonical: `/products/${product.slug}` }, openGraph: { type: "website", title: product.title, description, url: `/products/${product.slug}`, images: product.media[0] ? [{ url: product.media[0].url, alt: product.media[0].alt || product.title }] : undefined }, twitter: { card: "summary_large_image", title: product.title, description, images: product.media[0] ? [product.media[0].url] : undefined } };
}

const skinTypeLabels: Record<string, string> = {
  OILY: "چرب",
  DRY: "خشک",
  COMBINATION: "مختلط",
  NORMAL: "نرمال",
  SENSITIVE: "حساس",
  UNKNOWN: "نامشخص"
};

const budgetLabels: Record<string, string> = {
  ECONOMY: "اقتصادی",
  BALANCED: "متعادل",
  PREMIUM: "پرمیوم"
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

function toPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const profileId = cookieStore.get("beauty_profile_id")?.value;
  const customer = await getCustomerUser();

  const [product, savedProfile] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, status: "ACTIVE" },
      include: {
        brand: true,
        category: true,
        media: { orderBy: { sortOrder: "asc" } },
        concerns: { include: { concern: true } },
        skinSuitability: { orderBy: { score: "desc" } },
        ingredients: { include: { ingredient: true }, orderBy: { position: "asc" } },
        reviews: { where: { status: "APPROVED" }, include: { outcome: true }, orderBy: { createdAt: "desc" } }
      }
    }),
    profileId
      ? prisma.beautyProfile.findUnique({
          where: { id: profileId },
          include: { concerns: { include: { concern: true } } }
        })
      : null
  ]);

  if (!product) notFound();
  const isFavorite = customer ? Boolean(await prisma.favorite.findUnique({ where: { userId_productId: { userId: customer.id, productId: product.id } }, select: { id: true } })) : false;
  const isCompared = (cookieStore.get(COMPARE_COOKIE)?.value || "").split(",").includes(product.id);

  const activeProfile: MatchProfile | null = savedProfile
    ? {
        skinType: savedProfile.skinType,
        budgetTier: savedProfile.budgetTier,
        fragranceFree: savedProfile.fragranceFree,
        alcoholFree: savedProfile.alcoholFree,
        concernSlugs: savedProfile.concerns.map((item) => item.concern.slug)
      }
    : null;

  const profileSimilarReviews = activeProfile
    ? product.reviews.filter((review) => review.skinTypeAtReview === activeProfile.skinType)
    : [];

  const match = activeProfile
    ? calculateMatchScore(activeProfile, {
        budgetTier: product.budgetTier,
        fragranceFree: product.fragranceFree,
        alcoholFree: product.alcoholFree,
        concernSlugs: product.concerns.map((item) => item.concern.slug),
        skinSuitability: Object.fromEntries(product.skinSuitability.map((item) => [item.skinType, item.score])),
        similarReviewSignal: getSimilarReviewSignal(
          profileSimilarReviews.map((review) => ({ rating: review.rating, irritation: review.outcome?.irritation }))
        )
      })
    : null;

  const similarReviews = activeProfile
    ? profileSimilarReviews
    : product.reviews;
  const averageRating = product.reviews.length
    ? product.reviews.reduce((total, review) => total + review.rating, 0) / product.reviews.length
    : 0;
  const availableStock = Math.max(0, product.stock - product.reservedStock);
  const image = product.media[0];
  const seo = await getSeoSettings();
  const structuredData = { "@context": "https://schema.org", "@type": "Product", name: product.title, description: product.description || product.subtitle, image: product.media.map((item) => new URL(item.url, seo.siteUrl).toString()), sku: product.id, brand: { "@type": "Brand", name: product.brand.name }, category: product.category.title, offers: { "@type": "Offer", url: `${seo.siteUrl}/products/${product.slug}`, priceCurrency: "IRR", price: product.price * 10, availability: availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }, ...(product.reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: averageRating, reviewCount: product.reviews.length } } : {}) };

  return (
    <main className="home-shell product-detail-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      {query.favoriteAdded ? <div className="cart-message success">محصول به علاقه‌مندی‌ها اضافه شد.</div> : null}{query.favoriteRemoved ? <div className="cart-message">محصول از علاقه‌مندی‌ها حذف شد.</div> : null}{query.compareAdded ? <div className="cart-message success">محصول به مقایسه اضافه شد. <a href="/compare">مشاهده مقایسه</a></div> : null}{query.compareRemoved ? <div className="cart-message">محصول از مقایسه حذف شد.</div> : null}{query.compareError ? <div className="cart-message error">حداکثر ۴ محصول را می‌توانی مقایسه کنی.</div> : null}
      <nav className="breadcrumb" aria-label="مسیر صفحه">
        <a href="/">خانه</a><span>/</span><a href="/products">فروشگاه</a><span>/</span><span>{product.title}</span>
      </nav>

      <section className="product-detail-hero">
        <div className="product-gallery">
          {image ? (
            <>
              <Image src={image.url} alt={image.alt || product.title} width={900} height={900} priority className="detail-product-image" />
              {product.media.length > 1 ? <div className="detail-gallery-strip">{product.media.slice(1).map((media) => <Image key={media.id} src={media.url} alt={media.alt || product.title} width={180} height={180} />)}</div> : null}
            </>
          ) : (
            <div className="detail-image-empty">تصویر محصول به‌زودی اضافه می‌شود</div>
          )}
        </div>

        <div className="product-detail-info">
          <p className="eyebrow">{product.brand.name} · {product.category.title}</p>
          <h1>{product.title}</h1>
          {product.subtitle ? <p className="detail-subtitle">{product.subtitle}</p> : null}

          <div className="rating-row">
            <strong>★ {toPersianNumber(averageRating)}</strong>
            <span>از {toPersianNumber(product.reviews.length)} تجربه ثبت‌شده</span>
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-tags">
            {product.fragranceFree ? <span>بدون عطر</span> : null}
            {product.alcoholFree ? <span>بدون الکل</span> : null}
            {product.suitableForSensitive ? <span>مناسب پوست حساس</span> : null}
            <span>{budgetLabels[product.budgetTier]}</span>
          </div>

          <div className="purchase-panel">
            <div className="detail-price"><strong>{formatPrice(product.price)}</strong><span>تومان</span></div>
            <span className={availableStock > 0 ? "stock-status in-stock" : "stock-status"}>
              {availableStock > 0 ? `${toPersianNumber(availableStock)} عدد موجود` : "ناموجود"}
            </span>
          </div>

          <form action={addToCart} className="detail-cart-form">
            <input type="hidden" name="productId" value={product.id} />
            <button type="submit" className="primary-action detail-cta" disabled={availableStock === 0}>افزودن به سبد خرید</button>
          </form>
          <div className="detail-save-actions"><form action={toggleFavorite}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={`/products/${product.slug}`} /><button className={isFavorite ? "selected" : ""}>{isFavorite ? "♥ ذخیره‌شده در علاقه‌مندی‌ها" : "♡ ذخیره برای بعد"}</button></form><form action={toggleCompare}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="returnTo" value={`/products/${product.slug}`} /><button className={isCompared ? "selected" : ""}>{isCompared ? "✓ در مقایسه" : "⇄ افزودن به مقایسه"}</button></form></div>
          <p className="cta-note">افزودن به سبد موجودی را کم نمی‌کند؛ موجودی هنگام ثبت سفارش دوباره بررسی می‌شود.</p>
        </div>
      </section>

      <section className="match-detail-section">
        <div className="match-detail-heading">
          <div><p className="eyebrow">BeautyOS Match</p><h2>این محصول چقدر برای تو مناسب است؟</h2></div>
          {match ? <div className="large-match-score"><strong>{toPersianNumber(match.score)}٪</strong><span>تطابق</span></div> : null}
        </div>

        {match ? (
          <div className="match-explanation-grid">
            <div className="match-explanation positive"><h3>چرا انتخاب خوبی است</h3><ul>{match.positiveReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
            <div className="match-explanation caution"><h3>قبل از استفاده بدان</h3><ul>{match.warnings.length ? match.warnings.map((warning) => <li key={warning}>{warning}</li>) : <li>هشدار خاصی برای پروفایل تو ثبت نشده است.</li>}</ul></div>
            {match.missingData.length ? <div className="match-explanation missing"><h3>داده ناکامل</h3><ul>{match.missingData.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
          </div>
        ) : (
          <div className="passport-prompt"><div><strong>برای دیدن درصد تطابق، پاسپورتت را بساز.</strong><p>نوع پوست، دغدغه و بودجه‌ات را مشخص کن تا این بخش شخصی شود.</p></div><a href="/passport" className="primary-action">ساخت پاسپورت</a></div>
        )}
      </section>

      <section className="detail-columns">
        <div className="detail-section-block">
          <p className="eyebrow">ترکیبات کلیدی</p>
          <h2>داخل این محصول چیست؟</h2>
          <div className="ingredient-list">
            {product.ingredients.length ? product.ingredients.map(({ ingredient }) => (
              <article key={ingredient.id}><strong>{ingredient.name}</strong><p>{ingredient.description || "اطلاعات تکمیلی این ترکیب به‌زودی اضافه می‌شود."}</p></article>
            )) : <p className="muted">ترکیبات این محصول هنوز ثبت نشده‌اند.</p>}
          </div>
        </div>

        <div className="detail-section-block">
          <p className="eyebrow">سازگاری پوست</p>
          <h2>برای چه پوستی بهتر است؟</h2>
          <div className="suitability-list">
            {product.skinSuitability.map((item) => (
              <div key={item.skinType}><span>{skinTypeLabels[item.skinType]}</span><div><i style={{ width: `${Math.max(8, Math.min(100, 50 + item.score * 2))}%` }} /></div><strong>{item.score > 0 ? "مناسب" : "احتیاط"}</strong></div>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-intro"><div><p className="eyebrow">تجربه واقعی</p><h2>{activeProfile ? `نظر افراد با پوست ${skinTypeLabels[activeProfile.skinType]}` : "نظر کاربران"}</h2></div><span className="review-summary">★ {toPersianNumber(averageRating)} از ۵</span></div>
        <div className="review-grid">
          {similarReviews.length ? similarReviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-meta"><strong>{review.title || "تجربه استفاده"}</strong><span>{"★".repeat(review.rating)}</span></div>
              <p>{review.body || "بدون توضیح"}</p>
              <footer><span>پوست {skinTypeLabels[review.skinTypeAtReview]} {review.source === "VERIFIED_PURCHASE" ? "· خرید تأییدشده" : ""}</span><span>{review.wouldRepurchase ? "دوباره می‌خرم" : "دنبال جایگزینم"}</span></footer>
              {review.adminReply ? <div className="review-admin-reply"><strong>پاسخ BeautyOS</strong><p>{review.adminReply}</p></div> : null}
            </article>
          )) : <div className="empty-state">هنوز تجربه‌ای از پوست مشابه تو برای این محصول نداریم.</div>}
        </div>
      </section>
    </main>
  );
}
