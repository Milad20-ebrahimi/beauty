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
      <section className="home-hero">
        <div className="hero-content">
          <p className="eyebrow">Beauty Passport شخصی تو</p>
          <h1>محصولی بخر که برای پوست تو ساخته شده.</h1>
          <p className="hero-copy">
            پوست، دغدغه و بودجه‌ات را می‌شناسیم و از میان محصولات، انتخاب‌های مناسب‌تر را با دلیل روشن مرتب می‌کنیم.
          </p>
          <div className="hero-actions">
            <a href="/passport" className="primary-action">شروع تست رایگان ←</a>
            <a href="#needs" className="secondary-action">انتخاب براساس نیاز</a>
          </div>
        </div>
        <div className="hero-preview" aria-label="نمونه نتیجه پیشنهاد شخصی">
          <div className="preview-backdrop" />
          <div className="hero-insight">
            <div className="insight-top">
              <div className="product-mini"><small>پیشنهاد اول برای تو</small><strong>ضدآفتاب کنترل چربی</strong><small>Derma Safe</small></div>
              <div className="score-ring"><span>۹۱٪</span></div>
            </div>
            <p>انتخاب قوی برای پوست چرب و حساس با بودجه متعادل.</p>
            <div className="match-factors">
              <div className="factor-row"><i /> سازگار با نوع پوست تو</div>
              <div className="factor-row"><i /> مناسب دغدغه جوش</div>
              <div className="factor-row warning"><i /> نیاز به تمدید هر دو ساعت</div>
            </div>
            <div className="mini-metrics"><span>بدون عطر</span><span>۳۲ تجربه مشابه</span><span>اقتصادی</span></div>
          </div>
        </div>
      </section>

      <section className="needs-panel" id="needs" aria-labelledby="needs-title">
        <div className="section-intro"><div><h2 id="needs-title">امروز دنبال چه چیزی هستی؟</h2><p>مستقیم از دغدغه‌ات شروع کن.</p></div></div>
        <div className="need-grid">
          {needs.map(([need, description], index) => (
            <a key={need} href={`/needs?intent=${encodeURIComponent(need)}`} className="need-card">
              <span className="need-number">۰{index + 1}</span>
              <strong>{need}</strong>
              <span>{description}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
