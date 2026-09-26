import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore, type MatchProfile } from "@/features/recommendation/match-score";

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
      concerns: { include: { concern: true } },
      skinSuitability: true,
      reviews: {
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

      const score = calculateMatchScore(activeProfile, {
        budgetTier: product.budgetTier,
        fragranceFree: product.fragranceFree,
        alcoholFree: product.alcoholFree,
        concernSlugs: product.concerns.map((item) => item.concern.slug),
        skinSuitability: Object.fromEntries(product.skinSuitability.map((item) => [item.skinType, item.score]))
      });

      const similarReviews = product.reviews.filter((review) => review.skinTypeAtReview === activeProfile.skinType);

      return { product, score, similarReviews };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.score.score - a.score.score);

  return (
    <main className="home-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Personal Match Score</p>
        <h1>پیشنهاد محصول براساس Beauty Passport تو</h1>
        <p className="hero-copy">
          محصولات از PostgreSQL خوانده می‌شوند و امتیاز هر محصول سمت سرور براساس پروفایلی که ساخته‌ای محاسبه می‌شود.
        </p>
      </section>

      {activeProfile ? (
        <section className="profile-summary" aria-labelledby="profile-title">
          <h2 id="profile-title">پروفایل فعال</h2>
          <div className="summary-row">
            <span>نوع پوست: {skinTypeLabels[activeProfile.skinType]}</span>
            <span>بودجه: {budgetLabels[activeProfile.budgetTier]}</span>
            {activeProfile.fragranceFree ? <span>ترجیح: بدون عطر</span> : null}
            {activeProfile.alcoholFree ? <span>ترجیح: بدون الکل</span> : null}
            {savedProfile?.concerns.map((item) => <span key={item.concernId}>نیاز: {item.concern.title}</span>)}
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
              <div>
                <p className="eyebrow">{product.brand.name} / {product.category.title}</p>
                <h2>{product.title}</h2>
                {product.subtitle ? <p className="muted">{product.subtitle}</p> : null}
              </div>

              <div className="score-badge">
                <strong>{score.score}%</strong>
                <span>Match for you</span>
              </div>

              <p className="product-description">{product.description}</p>

              <div className="reason-grid">
                <div>
                  <h3>چرا مناسب است؟</h3>
                  <ul>
                    {score.positiveReasons.length > 0
                      ? score.positiveReasons.map((reason) => <li key={reason}>{reason}</li>)
                      : <li>برای پیشنهاد دقیق‌تر به داده بیشتری نیاز داریم.</li>}
                  </ul>
                </div>
                <div>
                  <h3>نکات احتیاط</h3>
                  <ul>
                    {score.warnings.length > 0
                      ? score.warnings.map((warning) => <li key={warning}>{warning}</li>)
                      : <li>هشدار خاصی برای این پروفایل ثبت نشده است.</li>}
                  </ul>
                </div>
              </div>

              <div className="card-footer">
                <span>{formatPrice(product.price)} تومان</span>
                <span>{similarReviews.length} تجربه از پوست مشابه</span>
              </div>
            </article>
          ))
        )}
      </section> : null}
    </main>
  );
}
