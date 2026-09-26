const recommendationPrinciples = [
  "اول نیاز کاربر را می‌فهمیم.",
  "بعد محصولات کمی اما دقیق پیشنهاد می‌دهیم.",
  "برای هر پیشنهاد دلیل مثبت، هشدار و داده ناقص را نشان می‌دهیم."
];

export default function NeedsPage() {
  return (
    <main className="home-shell">
      <section className="hero">
        <p className="eyebrow">Shopping by Need</p>
        <h1>از مشکل شروع کن، نه از دسته‌بندی.</h1>
        <p className="hero-copy">
          مسیر اصلی خرید در BeautyOS براساس نیاز است: جوش، خشکی، ضدآفتاب، روتین ساده یا بودجه محدود.
        </p>
      </section>

      <section className="needs-panel" aria-labelledby="needs-flow-title">
        <h2 id="needs-flow-title">منطق پیشنهاد در MVP</h2>
        <div className="need-grid">
          {recommendationPrinciples.map((item) => (
            <div key={item} className="need-card">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

