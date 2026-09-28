"use client";

import { useMemo, useState } from "react";
import { saveRoutine } from "./actions";

type Candidate = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  imageUrl: string | null;
  score: { score: number; positiveReasons: string[]; warnings: string[] };
};

type Slot = {
  key: string;
  period: "MORNING" | "NIGHT";
  title: string;
  description: string;
  order: number;
  options: Candidate[];
};

const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

export function RoutineEditor({ slots, saved, initialSelected }: { slots: Slot[]; saved: boolean; initialSelected: Record<string, string> }) {
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(slots.map((slot) => [slot.key, initialSelected[slot.key] || slot.options[0]?.id || ""]))
  );

  const total = useMemo(() => {
    const uniqueProducts = new Map<string, Candidate>();
    slots.forEach((slot) => {
      const product = slot.options.find((item) => item.id === selected[slot.key]);
      if (product) uniqueProducts.set(product.id, product);
    });
    return [...uniqueProducts.values()].reduce((sum, product) => sum + product.price, 0);
  }, [selected, slots]);

  return (
    <form action={saveRoutine} className="routine-builder">
      {saved ? <div className="routine-success">روتین تو ذخیره شد. هر زمان محصول‌ها تغییر کنند می‌توانی دوباره آن را به‌روزرسانی کنی.</div> : null}
      {(["MORNING", "NIGHT"] as const).map((period) => (
        <section className={`routine-period ${period === "NIGHT" ? "night" : ""}`} key={period}>
          <header className="routine-period-head">
            <div><span>{period === "MORNING" ? "صبح" : "شب"}</span><h2>روتین {period === "MORNING" ? "شروع روز" : "پایان روز"}</h2></div>
            <p>{period === "MORNING" ? "محافظت و آماده‌سازی پوست برای روز" : "پاک‌سازی و کمک به بازسازی پوست"}</p>
          </header>
          <div className="routine-steps">
            {slots.filter((slot) => slot.period === period).map((slot) => {
              const product = slot.options.find((item) => item.id === selected[slot.key]);
              return (
                <article className={`routine-step ${!product ? "missing" : ""}`} key={slot.key}>
                  <div className="routine-step-number">{slot.order}</div>
                  {product ? (
                    <>
                      <a className="routine-product-image" href={`/products/${product.slug}`}>
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.title} /> : <span>بدون تصویر</span>}
                        <strong>{product.score.score}%</strong>
                      </a>
                      <div className="routine-step-content">
                        <p className="routine-step-label">{slot.title} · {slot.description}</p>
                        <h3><a href={`/products/${product.slug}`}>{product.title}</a></h3>
                        {product.subtitle ? <p>{product.subtitle}</p> : null}
                        <div className="routine-reason">{product.score.positiveReasons[0] || "بهترین گزینه موجود برای این مرحله"}</div>
                        {product.score.warnings[0] ? <div className="routine-warning">احتیاط: {product.score.warnings[0]}</div> : null}
                        {slot.options.length > 1 ? (
                          <label className="routine-replace">تعویض محصول
                            <select name={slot.key} value={selected[slot.key]} onChange={(event) => setSelected((current) => ({ ...current, [slot.key]: event.target.value }))}>
                              {slot.options.map((option) => <option key={option.id} value={option.id}>{option.title} — {option.score.score}٪</option>)}
                            </select>
                          </label>
                        ) : <input type="hidden" name={slot.key} value={product.id} />}
                      </div>
                      <strong className="routine-price">{formatPrice(product.price)} <small>تومان</small></strong>
                    </>
                  ) : (
                    <div className="routine-missing-content">
                      <p className="routine-step-label">{slot.title} · اختیاری</p>
                      <h3>هنوز محصول مناسبی برای این مرحله نداریم</h3>
                      <p>بعد از اضافه‌شدن محصول فعال با نقش «سرم»، این بخش خودکار تکمیل می‌شود.</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <aside className="routine-summary">
        <div><span>مجموع محصولات انتخابی</span><strong>{formatPrice(total)} تومان</strong><small>محصول مشترک صبح و شب فقط یک‌بار محاسبه شده است.</small></div>
        <button className="primary-action" type="submit">ذخیره روتین من</button>
      </aside>
    </form>
  );
}
