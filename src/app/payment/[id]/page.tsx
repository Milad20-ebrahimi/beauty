import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { submitPaymentReceipt } from "./actions";

export const dynamic = "force-dynamic";
const formatPrice = (price: number) => new Intl.NumberFormat("fa-IR").format(price);
const receiptLabels: Record<string, string> = { PENDING: "در انتظار بررسی", APPROVED: "تأییدشده", REJECTED: "نیاز به ارسال مجدد" };

export default async function PaymentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { address: true, paymentReceipt: true } }),
    prisma.manualPaymentSettings.findUnique({ where: { id: "default" } })
  ]);
  if (!order?.address) notFound();
  const canSubmit = order.status === "PENDING_PAYMENT" && order.paymentReceipt?.status !== "APPROVED" && settings?.active;
  return <main className="home-shell payment-page">
    <section className="compact-hero results-header"><div className="hero-content"><p className="eyebrow">پرداخت سفارش</p><h1>پرداخت کارت‌به‌کارت</h1><p className="hero-copy">مبلغ را انتقال بده و تصویر رسید را برای بررسی مدیر بارگذاری کن.</p></div></section>
    {query.submitted ? <div className="cart-message success">رسید دریافت شد و در صف بررسی قرار گرفت.</div> : null}
    {query.error ? <div className="cart-message error">{query.error === "locked" ? "این سفارش دیگر امکان ارسال رسید ندارد." : query.error === "disabled" ? "پرداخت کارت‌به‌کارت موقتاً غیرفعال است." : decodeURIComponent(query.error)}</div> : null}
    {!settings ? <section className="empty-state"><h2>اطلاعات پرداخت هنوز تنظیم نشده است.</h2><p>مدیر فروشگاه باید ابتدا شماره کارت را در پنل مدیریت ثبت کند.</p></section> : <div className="payment-layout">
      <section className="payment-card"><p>مبلغ دقیق قابل پرداخت</p><strong>{formatPrice(order.total)} <small>تومان</small></strong><div className="bank-details"><span>شماره کارت</span><b dir="ltr">{settings.cardNumber}</b><span>به نام</span><b>{settings.holderName}</b>{settings.bankName ? <><span>بانک</span><b>{settings.bankName}</b></> : null}{settings.iban ? <><span>شماره شبا</span><b dir="ltr">{settings.iban}</b></> : null}</div>{settings.instructions ? <p className="payment-instructions">{settings.instructions}</p> : null}<div className="order-reference"><span>کد سفارش</span><strong>{order.id}</strong></div></section>
      <section className="receipt-panel"><div><p className="admin-kicker">مرحله دوم</p><h2>ارسال تصویر رسید</h2><p>تصویر خوانا و کامل باشد؛ مبلغ، زمان و شماره پیگیری مشخص باشد.</p></div>
        {order.paymentReceipt ? <div className={`receipt-status ${order.paymentReceipt.status.toLowerCase()}`}><span>{receiptLabels[order.paymentReceipt.status]}</span><Image src={order.paymentReceipt.imageUrl} alt="رسید پرداخت" width={520} height={520} />{order.paymentReceipt.adminNote ? <p><strong>توضیح مدیر:</strong> {order.paymentReceipt.adminNote}</p> : null}</div> : null}
        {canSubmit ? <form action={submitPaymentReceipt.bind(null, order.id)}><label className="admin-upload-zone"><span>{order.paymentReceipt ? "ارسال رسید جدید" : "انتخاب تصویر رسید"}</span><input type="file" name="receipt" accept="image/jpeg,image/png,image/webp" required /><small>JPG، PNG یا WebP تا ۵ مگابایت</small></label><label>توضیح برای مدیر <small>اختیاری</small><textarea name="customerNote" rows={3} placeholder="مثلاً چهار رقم آخر کارت پرداخت‌کننده" /></label><button type="submit" className="primary-action">ثبت رسید برای بررسی</button></form> : null}
      </section>
    </div>}
  </main>;
}
