import { prisma } from "@/lib/prisma";
import { savePaymentSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const settings = await prisma.manualPaymentSettings.findUnique({ where: { id: "default" } });
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">تنظیمات فروش</p><h1>پرداخت کارت‌به‌کارت</h1><p>اطلاعاتی که مشتری بعد از ثبت سفارش برای انتقال وجه می‌بیند.</p></div></header>
    <section className="admin-help-note"><strong>روش استفاده:</strong><p>شماره کارت را ثبت و گزینه فعال را روشن کن. مشتری رسید می‌فرستد و شما آن را از صفحه سفارش‌ها تأیید یا رد می‌کنی.</p></section>
    {query.saved ? <div className="admin-alert success">تنظیمات پرداخت ذخیره شد.</div> : null}{query.error ? <div className="admin-alert error">شماره کارت باید ۱۶ رقم و شماره شبا در صورت ورود ۲۴ رقم باشد.</div> : null}
    <form action={savePaymentSettings} className="admin-product-form compact-form"><section className="admin-form-section"><div className="admin-form-heading"><span>۱</span><div><h2>اطلاعات حساب</h2><p>اطلاعات را دقیقاً مطابق کارت بانکی وارد کن.</p></div></div><div className="admin-form-grid"><label>شماره کارت<input name="cardNumber" dir="ltr" inputMode="numeric" required defaultValue={settings?.cardNumber || ""} placeholder="6037991234567890" /></label><label>نام صاحب کارت<input name="holderName" required defaultValue={settings?.holderName || ""} /></label><label>نام بانک<input name="bankName" defaultValue={settings?.bankName || ""} /></label><label>شماره شبا <small>اختیاری، بدون IR</small><input name="iban" dir="ltr" inputMode="numeric" defaultValue={settings?.iban?.replace(/^IR/, "") || ""} /></label><label className="field-wide">راهنمای پرداخت<textarea name="instructions" rows={4} defaultValue={settings?.instructions || ""} placeholder="پس از انتقال وجه، تصویر رسید خوانا را بارگذاری کنید." /></label><label className="payment-active"><input type="checkbox" name="active" defaultChecked={settings?.active ?? true} /> پرداخت کارت‌به‌کارت برای مشتری فعال باشد</label></div></section><div className="admin-form-actions"><button type="submit" className="primary-action">ذخیره تنظیمات</button></div></form>
  </main>;
}
