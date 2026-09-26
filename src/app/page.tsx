const needs = [
  "پوستم جوش می‌زند",
  "پوستم خشک است",
  "ضدآفتاب مناسب پیدا نمی‌کنم",
  "روتین ساده می‌خواهم",
  "محصول اقتصادی می‌خواهم",
  "نمی‌دانم چی بخرم"
];

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero">
        <p className="eyebrow">Beauty Passport</p>
        <h1>بین هزاران محصول سردرگم نشو.</h1>
        <p className="hero-copy">
          اول پوست، نیاز و بودجه‌ات را می‌شناسیم؛ بعد محصولاتی را پیشنهاد می‌دهیم که دلیل انتخابشان شفاف است.
        </p>
        <div className="hero-actions">
          <a href="/passport" className="primary-action">Beauty Profile من را بساز</a>
          <a href="/needs" className="secondary-action">از روی نیاز خرید کنم</a>
          <a href="/recommendations" className="secondary-action">دموی پیشنهاد محصول</a>
        </div>
      </section>

      <section className="needs-panel" aria-labelledby="needs-title">
        <h2 id="needs-title">برای چی اومدی؟</h2>
        <div className="need-grid">
          {needs.map((need) => (
            <a key={need} href={`/needs?intent=${encodeURIComponent(need)}`} className="need-card">
              {need}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
