import { prisma } from "@/lib/prisma";
import { calculateMatchScore, type MatchProfile } from "@/features/recommendation/match-score";

export const dynamic = "force-dynamic";

const demoProfile: MatchProfile = {
  skinType: "OILY",
  budgetTier: "BALANCED",
  fragranceFree: true,
  alcoholFree: true,
  concernSlugs: ["acne", "sun-protection", "basic-routine"]
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default async function RecommendationsPage() {
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

  const scoredProducts = products
    .map((product) => {
      const score = calculateMatchScore(demoProfile, {
        budgetTier: product.budgetTier,
        fragranceFree: product.fragranceFree,
        alcoholFree: product.alcoholFree,
        concernSlugs: product.concerns.map((item) => item.concern.slug),
        skinSuitability: Object.fromEntries(product.skinSuitability.map((item) => [item.skinType, item.score]))
      });

      const similarReviews = product.reviews.filter((review) => review.skinTypeAtReview === demoProfile.skinType);

      return { product, score, similarReviews };
    })
    .sort((a, b) => b.score.score - a.score.score);

  return (
    <main className="home-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Personal Match Score</p>
        <h1>پیشنهاد محصول براساس پروفایل نمونه</h1>
        <p className="hero-copy">
          این صفحه فعلاً یک demo واقعی است: محصولات از PostgreSQL خوانده می‌شوند و امتیاز هر محصول سمت سرور محاسبه می‌شود.
        </p>
      </section>

      <section className="profile-summary" aria-labelledby="profile-title">
        <h2 id="profile-title">پروفایل تست</h2>
        <div className="summary-row">
          <span>نوع پوست: چرب</span>
          <span>بودجه: متعادل</span>
          <span>ترجیح: بدون عطر و الکل</span>
          <span>نیاز: جوش + ضدآفتاب + روتین ساده</span>
        </div>
      </section>

      <section className="recommendation-list" aria-label="پیشنهادهای محصول">
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
      </section>
    </main>
  );
}

