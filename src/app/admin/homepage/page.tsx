import { getHomeSettings } from "@/lib/home-settings";
import { saveHomepage } from "./actions";
import { prisma } from "@/lib/prisma";
import { HomepageCampaignEditor } from "./campaign-editor";
export const dynamic = "force-dynamic";

const Toggle = ({ name, checked, title, hint }: { name:string; checked:boolean; title:string; hint:string }) => <label className="homepage-toggle"><input type="checkbox" name={name} defaultChecked={checked}/><span><strong>{title}</strong><small>{hint}</small></span></label>;

export default async function HomepageAdmin({ searchParams }: { searchParams:Promise<{success?:string;error?:string}> }) {
  const [home,query,assets] = await Promise.all([getHomeSettings(),searchParams,prisma.mediaAsset.findMany({select:{id:true,url:true,kind:true,alt:true},orderBy:{createdAt:"desc"},take:30})]);
  const serializableHome = JSON.parse(JSON.stringify(home));
  return <main className="admin-page"><header className="admin-page-header"><div><p className="admin-kicker">ویترین اصلی فروشگاه</p><h1>مدیریت صفحه اصلی</h1><p>Hero، رسانه موبایل، Poster و دو Campaign Banner را از یک جریان روشن مدیریت کن.</p></div><a href="/" className="secondary-action">دیدن صفحه اصلی</a></header>
    <section className="admin-help-note"><strong>ترتیب پیشنهادی کار:</strong><p>رسانه‌ها را در کتابخانه آپلود کن؛ سپس نوع Hero، فایل دسکتاپ و موبایل، Poster، متن و Overlay را تنظیم کن و قبل از ذخیره Preview را ببین.</p></section>
    {query.success?<div className="admin-alert success">صفحه اصلی ذخیره و منتشر شد.</div>:null}{query.error?<div className="admin-alert error">{query.error==="url"?"لینک‌ها باید با https:// یا / شروع شوند.":query.error==="media"?"رسانه‌های ضروری Hero را متناسب با نوع انتخاب‌شده کامل کن.":query.error==="schedule"?"زمان پایان باید بعد از زمان شروع باشد.":"فیلدهای ضروری را کامل کن."}</div>:null}
    <form action={saveHomepage} className="admin-product-form homepage-admin-form">
      <HomepageCampaignEditor home={serializableHome} assets={assets}/>
      <section className="admin-form-section"><div className="admin-form-heading"><span>۳</span><div><h2>ردیف‌های محصول</h2><p>محصولات خودکار از کاتالوگ و سفارش‌های واقعی انتخاب می‌شوند.</p></div></div><div className="homepage-section-editor"><div><Toggle name="newProductsEnabled" checked={home.newProductsEnabled} title="تازه‌رسیده‌ها" hint="جدیدترین محصولات فعال"/><label>عنوان<input name="newProductsTitle" required defaultValue={home.newProductsTitle}/></label><label>توضیح<input name="newProductsDescription" defaultValue={home.newProductsDescription||""}/></label></div><div><Toggle name="bestSellersEnabled" checked={home.bestSellersEnabled} title="پرفروش‌ها" hint="براساس سفارش‌های موفق"/><label>عنوان<input name="bestSellersTitle" required defaultValue={home.bestSellersTitle}/></label><label>توضیح<input name="bestSellersDescription" defaultValue={home.bestSellersDescription||""}/></label></div></div></section>
      <section className="admin-form-section"><div className="admin-form-heading"><span>۴</span><div><h2>انتخاب براساس نیاز</h2><p>میانبرهایی برای رسیدن به مسئله پوستی مشتری.</p></div></div><Toggle name="needsEnabled" checked={home.needsEnabled} title="نمایش نیازهای پوستی" hint="کارت‌های جوش، خشکی، ضدآفتاب و بودجه"/><div className="admin-form-grid"><label>عنوان<input name="needsTitle" required defaultValue={home.needsTitle}/></label><label>توضیح<input name="needsDescription" defaultValue={home.needsDescription||""}/></label></div></section>
      <section className="admin-form-section"><div className="admin-form-heading"><span>۵</span><div><h2>معرفی Beauty Passport</h2><p>بخش پایانی برای معرفی مزیت اصلی فروشگاه.</p></div></div><Toggle name="passportEnabled" checked={home.passportEnabled} title="نمایش معرفی پاسپورت" hint="با خاموش‌کردن، کل بخش حذف می‌شود."/><div className="admin-form-grid"><label>برچسب کوچک<input name="passportEyebrow" defaultValue={home.passportEyebrow}/></label><label>عنوان<input name="passportTitle" required defaultValue={home.passportTitle}/></label><label className="field-wide">توضیح<textarea name="passportDescription" rows={3} defaultValue={home.passportDescription||""}/></label><label>متن دکمه<input name="passportButtonText" required defaultValue={home.passportButtonText}/></label><label>لینک دکمه<input name="passportButtonLink" dir="ltr" required defaultValue={home.passportButtonLink}/></label></div></section>
      <div className="admin-form-actions sticky-home-save"><button className="primary-action">ذخیره و انتشار صفحه اصلی</button><a href="/" className="secondary-action">مشاهده خروجی</a></div>
    </form>
  </main>;
}
