const needs = [
  ["پوستم جوش می‌زند", "محصولاتی که با پوست مستعد جوش سازگارترند."],
  ["پوستم خشک است", "انتخاب‌های ملایم‌تر برای خشکی و کشیدگی پوست."],
  ["ضدآفتاب مناسب پیدا نمی‌کنم", "شروع خوب برای انتخاب ضدآفتاب روزانه."],
  ["روتین ساده می‌خواهم", "یک مسیر کوتاه برای صبح و شب."],
  ["محصول اقتصادی می‌خواهم", "گزینه‌های کم‌ریسک‌تر داخل بودجه محدود."],
  ["نمی‌دانم چی بخرم", "از چند سؤال ساده شروع کن."]
];

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero home-hero">
        <div className="hero-content">
          <p className="eyebrow">Beauty Passport</p>
          <h1>بین هزاران محصول سردرگم نشو.</h1>
          <p className="hero-copy">
            اول پوست، نیاز و بودجه‌ات را می‌شناسیم؛ بعد محصولاتی را پیشنهاد می‌دهیم که دلیل انتخابشان شفاف است.
          </p>
          <div className="hero-actions">
            <a href="/passport" className="primary-action">Beauty Profile من را بساز</a>
            <a href="/recommendations" className="secondary-action">دیدن پیشنهادها</a>
          </div>
        </div>
        <div className="hero-insight" aria-label="نمونه خروجی پیشنهاد">
          <span className="score-pill">91%</span>
          <h2>Match Score شخصی</h2>
          <p>هر پیشنهاد باید توضیح بدهد چرا برای تو مناسب است، چه محدودیتی دارد، و آیا داده کافی داریم یا نه.</p>
          <div className="mini-metrics">
            <span>بدون تبلیغ پنهان</span>
            <span>Review افراد مشابه</span>
            <span>بودجه‌محور</span>
          </div>
        </div>
      </section>

      <section className="needs-panel" aria-labelledby="needs-title">
        <h2 id="needs-title">برای چی اومدی؟</h2>
        <div className="need-grid">
          {needs.map(([need, description]) => (
            <a key={need} href={`/needs?intent=${encodeURIComponent(need)}`} className="need-card">
              <strong>{need}</strong>
              <span>{description}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
