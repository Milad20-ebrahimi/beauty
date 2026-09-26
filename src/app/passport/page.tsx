import { prisma } from "@/lib/prisma";
import { saveBeautyPassport } from "./actions";

const skinTypes = [
  ["OILY", "چرب"],
  ["DRY", "خشک"],
  ["COMBINATION", "مختلط"],
  ["NORMAL", "نرمال"],
  ["SENSITIVE", "حساس"],
  ["UNKNOWN", "مطمئن نیستم"]
];

const hairTypes = [
  ["STRAIGHT", "صاف"],
  ["WAVY", "موج‌دار"],
  ["CURLY", "فر"],
  ["COILY", "خیلی فر"],
  ["UNKNOWN", "فعلاً مهم نیست"]
];

const budgetTiers = [
  ["ECONOMY", "اقتصادی"],
  ["BALANCED", "متعادل"],
  ["PREMIUM", "Premium"]
];

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const concerns = await prisma.concern.findMany({
    orderBy: { title: "asc" }
  });

  return (
    <main className="home-shell">
      <section className="hero compact-hero">
        <p className="eyebrow">Beauty Passport</p>
        <h1>اول خودت را بشناس، بعد خرید کن.</h1>
        <p className="hero-copy">
          این پرسش‌ها تشخیص پزشکی نیستند؛ فقط کمک می‌کنند پیشنهاد محصول شفاف‌تر و کم‌ریسک‌تر شود.
        </p>
      </section>

      <form action={saveBeautyPassport} className="passport-form">
        <section className="form-section">
          <h2>نوع پوست</h2>
          <div className="option-grid">
            {skinTypes.map(([value, label]) => (
              <label key={value} className="choice-card">
                <input type="radio" name="skinType" value={value} defaultChecked={value === "UNKNOWN"} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>دغدغه اصلی</h2>
          {concerns.length === 0 ? (
            <p className="muted">اول دستور <code>npm run db:seed</code> را اجرا کن تا گزینه‌های دغدغه ساخته شوند.</p>
          ) : (
            <div className="option-grid">
              {concerns.map((concern) => (
                <label key={concern.id} className="choice-card">
                  <input type="checkbox" name="concerns" value={concern.slug} />
                  <span>{concern.title}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>بودجه خرید</h2>
          <div className="option-grid">
            {budgetTiers.map(([value, label]) => (
              <label key={value} className="choice-card">
                <input type="radio" name="budgetTier" value={value} defaultChecked={value === "BALANCED"} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>مو و حساسیت‌ها</h2>
          <div className="option-grid">
            {hairTypes.map(([value, label]) => (
              <label key={value} className="choice-card">
                <input type="radio" name="hairType" value={value} defaultChecked={value === "UNKNOWN"} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="toggle-list">
            <label>
              <input type="checkbox" name="fragranceFree" />
              محصول بدون عطر ترجیح می‌دهم.
            </label>
            <label>
              <input type="checkbox" name="alcoholFree" />
              محصول بدون الکل ترجیح می‌دهم.
            </label>
            <label>
              <input type="checkbox" name="sensitive" />
              پوستم را حساس می‌دانم.
            </label>
          </div>
        </section>

        <div className="form-actions">
          <p>با ذخیره پروفایل، پیشنهادها براساس همین اطلاعات محاسبه می‌شوند.</p>
          <button type="submit" className="primary-action">ذخیره و دیدن پیشنهادها</button>
        </div>
      </form>
    </main>
  );
}

