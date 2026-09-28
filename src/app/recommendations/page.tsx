import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore, getSimilarReviewSignal, type MatchProfile } from "@/features/recommendation/match-score";

export const dynamic = "force-dynamic";

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
  PREMIUM: "Premium"
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default async function RecommendationsPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("beauty_profile_id")?.value;

  const savedProfile = profileId
    ? await prisma.beautyProfile.findUnique({
        where: { id: profileId },
        include: { concerns: { include: { concern: true } } }
      })
    : null;

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      brand: true,
      category: true,
      media: { take: 1, orderBy: { sortOrder: "asc" } },
      concerns: { include: { concern: true } },
      skinSuitability: true,
      reviews: {
        where: { status: "APPROVED" },
        include: { outcome: true },
        take: 6,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const activeProfile: MatchProfile | null = savedProfile
    ? {
        skinType: savedProfile.skinType,
        budgetTier: savedProfile.budgetTier,
        fragranceFree: savedProfile.fragranceFree,
        alcoholFree: savedProfile.alcoholFree,
        concernSlugs: savedProfile.concerns.map((item) => item.concern.slug)
      }
    : null;

  const scoredProducts = products
    .map((product) => {
      if (!activeProfile) return null;

      const similarReviews = product.reviews.filter((review) => review.skinTypeAtReview === activeProfile.skinType);
      const score = calculateMatchScore(activeProfile, {
        budgetTier: product.budgetTier,
        fragranceFree: product.fragranceFree,
        alcoholFree: product.alcoholFree,
        concernSlugs: product.concerns.map((item) => item.concern.slug),
        skinSuitability: Object.fromEntries(product.skinSuitability.map((item) => [item.skinType, item.score])),
        similarReviewSignal: getSimilarReviewSignal(
          similarReviews.map((review) => ({ rating: review.rating, irritation: review.outcome?.irritation }))
        )
      });

      return { product, score, similarReviews };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.score.score - a.score.score);

  return (
    <main className="home-shell">
      <section className="compact-hero results-header">
        <div className="hero-content">
          <p className="eyebrow">انتخاب‌شده برای تو</p>
          <h1>محصول‌های مناسب پوست تو</h1>
          <p className="hero-copy">از بیشترین تطابق مرتب شده‌اند؛ دلیل امتیاز و نکات احتیاط هر محصول را ببین.</p>
        </div>
      </section>

      {activeProfile ? (
        <section className="profile-summary" aria-labelledby="profile-title">
          <div>
            <p className="eyebrow">پروفایل فعال</p>
            <h2 id="profile-title">پیشنهادها برای پوست {skinTypeLabels[activeProfile.skinType]}</h2>
          </div>
          <div className="summary-row">
            <span>بودجه: {budgetLabels[activeProfile.budgetTier]}</span>
            {activeProfile.fragranceFree ? <span>بدون عطر</span> : null}
            {activeProfile.alcoholFree ? <span>بدون الکل</span> : null}
            {savedProfile?.concerns.map((item) => <span key={item.concernId}>{item.concern.title}</span>)}
          </div>
          <a href="/passport" className="inline-link">ویرایش Beauty Passport</a>
        </section>
      ) : (
        <section className="empty-state">
          <h2>هنوز Beauty Passport نداری.</h2>
          <p>اول چند سؤال کوتاه جواب بده تا پیشنهادها شخصی‌سازی شوند.</p>
          <a href="/passport" className="primary-action">ساخت Beauty Passport</a>
        </section>
      )}

      {activeProfile ? <section className="recommendation-list" aria-label="پیشنهادهای محصول">
        {scoredProducts.length === 0 ? (
          <div className="empty-state">
            هنوز محصولی در دیتابیس نیست. اول دستور <code>npm run db:seed</code> را اجرا کن.
          </div>
        ) : (
          scoredProducts.map(({ product, score, similarReviews }) => (
            <article key={product.id} className="product-card">
              <a href={`/products/${product.slug}`} className="product-visual" aria-label={`مشاهده ${product.title}`}>
                {product.media[0] ? <img src={product.media[0].url} alt={product.media[0].alt || product.title} className="catalog-product-image" /> : <div className="bottle-shape">{product.brand.name}</div>}
                <div className="score-badge"><strong>{score.score}%</strong><span>تطابق</span></div>
              </a>
              <div className="product-main">
                <p className="eyebrow">{product.brand.name} / {product.category.title}</p>
                <h2><a href={`/products/${product.slug}`}>{product.title}</a></h2>
                {product.subtitle ? <p className="muted">{product.subtitle}</p> : null}
                <p className="product-description">{product.description}</p>
                <div className="product-tags"><span>{product.fragranceFree ? "بدون عطر" : "دارای رایحه"}</span><span>{budgetLabels[product.budgetTier]}</span></div>
              </div>

              <div className="reason-grid">
                <div className="reason-panel">
                  <h3>چرا مناسب است؟</h3>
                  <ul>
                    {score.positiveReasons.length > 0
                      ? score.positiveReasons.map((reason) => <li key={reason}>{reason}</li>)
                      : <li>برای پیشنهاد دقیق‌تر به داده بیشتری نیاز داریم.</li>}
                  </ul>
                </div>
                <div className="reason-panel warning">
                  <h3>نکات احتیاط</h3>
                  <ul>
                    {score.warnings.length > 0
                      ? score.warnings.map((warning) => <li key={warning}>{warning}</li>)
                      : <li>هشدار خاصی برای این پروفایل ثبت نشده است.</li>}
                  </ul>
                </div>
              </div>

              <div className="card-footer">
                <span className="price"><strong>{formatPrice(product.price)} تومان</strong><small>قیمت ثبت‌شده</small></span>
                <a href={`/products/${product.slug}`} className="inline-link">مشاهده جزئیات ←</a>
              </div>
            </article>
          ))
        )}
      </section> : null}
    </main>
  );
}
