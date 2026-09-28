"use client";

import { useMemo, useState } from "react";

type Method = { id: string; title: string; description: string | null; price: number; freeAbove: number | null; estimatedDays: string | null };
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);

export function ShippingSelector({ methods, subtotal }: { methods: Method[]; subtotal: number }) {
  const [selectedId, setSelectedId] = useState(methods[0]?.id || "");
  const selected = methods.find((method) => method.id === selectedId);
  const fee = useMemo(() => selected ? (selected.freeAbove && subtotal >= selected.freeAbove ? 0 : selected.price) : 0, [selected, subtotal]);
  return <section className="checkout-shipping"><div className="checkout-section-head"><span>۲</span><div><h2>روش ارسال</h2><p>هزینه و زمان تحویل مناسب را انتخاب کن.</p></div></div><div className="shipping-choice-list">{methods.map((method) => { const actualFee = method.freeAbove && subtotal >= method.freeAbove ? 0 : method.price; return <label key={method.id}><input type="radio" name="shippingMethodId" value={method.id} checked={selectedId === method.id} onChange={() => setSelectedId(method.id)} required /><span><strong>{method.title}</strong><small>{method.description || "بدون توضیح"}{method.estimatedDays ? ` · ${method.estimatedDays}` : ""}</small></span><b>{actualFee === 0 ? "رایگان" : `${formatPrice(actualFee)} تومان`}</b></label>; })}</div>{selected ? <div className="shipping-live-total"><span>مبلغ نهایی با ارسال</span><strong>{formatPrice(subtotal + fee)} تومان</strong></div> : null}</section>;
}
