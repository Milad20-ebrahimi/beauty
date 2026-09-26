const questions = [
  "نوع پوست شما چیست؟",
  "مهم‌ترین دغدغه پوستی شما چیست؟",
  "بودجه خرید شما کدام است؟",
  "آیا به عطر یا الکل حساسیت دارید؟"
];

export default function PassportPage() {
  return (
    <main className="home-shell">
      <section className="hero">
        <p className="eyebrow">Beauty Passport</p>
        <h1>اول خودت را بشناس، بعد خرید کن.</h1>
        <p className="hero-copy">
          این پرسش‌ها تشخیص پزشکی نیستند؛ فقط کمک می‌کنند پیشنهاد محصول شفاف‌تر و کم‌ریسک‌تر شود.
        </p>
      </section>

      <section className="needs-panel" aria-labelledby="passport-title">
        <h2 id="passport-title">نسخه اول پرسش‌نامه</h2>
        <div className="need-grid">
          {questions.map((question) => (
            <div key={question} className="need-card">
              {question}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

