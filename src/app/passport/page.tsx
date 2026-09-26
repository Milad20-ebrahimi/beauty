import { prisma } from "@/lib/prisma";
import { saveBeautyPassport } from "./actions";

const skinTypes = [
  ["OILY", "چرب", "برق می‌افتد، منافذ و جوش بیشتر دیده می‌شود."],
  ["DRY", "خشک", "کشیدگی، پوسته‌پوسته شدن یا کم‌آبی حس می‌کنی."],
  ["COMBINATION", "مختلط", "بعضی قسمت‌ها چرب و بعضی قسمت‌ها خشک است."],
  ["NORMAL", "نرمال", "مشکل مشخصی نداری و تعادل پوست خوب است."],
  ["SENSITIVE", "حساس", "زود قرمز، ملتهب یا تحریک می‌شود."],
  ["UNKNOWN", "مطمئن نیستم", "فعلاً مطمئن نیستی و می‌خواهی با احتیاط شروع کنی."]
];

const hairTypes = [
  ["STRAIGHT", "صاف"],
  ["WAVY", "موج‌دار"],
  ["CURLY", "فر"],
  ["COILY", "خیلی فر"],
  ["UNKNOWN", "فعلاً مهم نیست"]
];

const budgetTiers = [
  ["ECONOMY", "اقتصادی", "انتخاب کم‌ریسک با هزینه کمتر."],
  ["BALANCED", "متعادل", "تعادل بین قیمت، کیفیت و تجربه کاربران."],
  ["PREMIUM", "Premium", "گزینه‌های کامل‌تر با قیمت بالاتر."]
];

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const concerns = await prisma.concern.findMany({
    orderBy: { title: "asc" }
  });

  return (
    <main className="home-shell">
      <section className="compact-hero passport-hero">
        <div className="hero-content">
          <p className="eyebrow">حدود ۲ دقیقه</p>
          <h1>پاسپورت زیبایی‌ات را بساز</h1>
          <p className="hero-copy">چند سؤال کوتاه برای اینکه محصول نامناسب از پیشنهادها حذف شود.</p>
        </div>
        <div className="trust-strip">
          <span>بدون تشخیص پزشکی</span>
          <span>قابل تغییر</span>
          <span>مبنای Match Score</span>
        </div>
      </section>

      <form action={saveBeautyPassport} className="passport-form">
        <div className="form-sections">
        <section className="form-section">
          <div className="section-heading">
            <span>۱</span>
            <div>
              <h2>نوع پوست</h2>
              <p>اگر مطمئن نیستی گزینه آخر را بزن؛ سیستم با احتیاط پیشنهاد می‌دهد.</p>
            </div>
          </div>
          <div className="option-grid">
            {skinTypes.map(([value, label, description]) => (
              <label key={value} className="choice-card">
                <input type="radio" name="skinType" value={value} defaultChecked={value === "UNKNOWN"} />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>۲</span>
            <div>
              <h2>دغدغه اصلی</h2>
              <p>یک یا چند مورد را انتخاب کن تا پیشنهادها از روی نیاز ساخته شوند.</p>
            </div>
          </div>
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
          <div className="section-heading">
            <span>۳</span>
            <div>
              <h2>بودجه خرید</h2>
              <p>بودجه باعث می‌شود محصول خوب اما نامتناسب با توان خرید پیشنهاد نشود.</p>
            </div>
          </div>
          <div className="option-grid">
            {budgetTiers.map(([value, label, description]) => (
              <label key={value} className="choice-card">
                <input type="radio" name="budgetTier" value={value} defaultChecked={value === "BALANCED"} />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>۴</span>
            <div>
              <h2>مو و حساسیت‌ها</h2>
              <p>این بخش فعلاً ساده است؛ بعداً برای روتین مو و فیلتر ترکیبات کامل‌تر می‌شود.</p>
            </div>
          </div>
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

        </div>
        <div className="form-actions">
          <strong>آماده دیدن نتیجه‌ای؟</strong>
          <p>پیشنهادها با توجه به پاسخ‌هایت مرتب می‌شوند و دلیل هر امتیاز را می‌بینی.</p>
          <button type="submit" className="primary-action">ساخت پاسپورت و دیدن نتیجه</button>
          <span className="privacy-note">اطلاعات این فرم فقط برای شخصی‌سازی پیشنهادها استفاده می‌شود.</span>
        </div>
      </form>
    </main>
  );
}
