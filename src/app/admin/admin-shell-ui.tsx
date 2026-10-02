"use client";

import { Bell, CaretLeft, MagnifyingGlass, Question, Storefront } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

type PageGuide = {
  title: string;
  section: string;
  description: string;
  steps: [string, string, string];
};

const guides: Array<{ match: (path: string) => boolean; guide: PageGuide }> = [
  { match: (p) => p === "/admin", guide: { title: "نمای کلی", section: "مرکز مدیریت", description: "مهم‌ترین عددها، فروش اخیر و کارهایی که نیاز به توجه دارند را در یک نگاه بررسی کن.", steps: ["کارت‌های آماری را بررسی کن", "کارهای فوری را انجام بده", "از گزارش فروش روندها را دقیق‌تر ببین"] } },
  { match: (p) => p.startsWith("/admin/reports"), guide: { title: "گزارش فروش", section: "مرکز مدیریت", description: "درآمد، سفارش‌ها و رفتار مشتری را مقایسه کن تا تصمیم‌های فروش بر اساس داده باشند.", steps: ["بازه و شاخص را انتخاب کن", "روند رشد یا افت را مقایسه کن", "برای کمپین بعدی تصمیم بگیر"] } },
  { match: (p) => p.startsWith("/admin/products/new"), guide: { title: "محصول جدید", section: "کاتالوگ", description: "اطلاعات فروش، تصاویر، موجودی و ویژگی‌های هوشمند یک محصول جدید را ثبت کن.", steps: ["اطلاعات پایه و قیمت را وارد کن", "رسانه و موجودی را کامل کن", "وضعیت را فعال و ذخیره کن"] } },
  { match: (p) => /^\/admin\/products\/[^/]+\/edit/.test(p), guide: { title: "ویرایش محصول", section: "کاتالوگ", description: "اطلاعات محصول موجود را اصلاح کن؛ تغییرات ذخیره‌شده مستقیماً در فروشگاه نمایش داده می‌شوند.", steps: ["اطلاعات فعلی را بازبینی کن", "فیلدهای لازم را تغییر بده", "ذخیره و خروجی فروشگاه را کنترل کن"] } },
  { match: (p) => p.startsWith("/admin/products"), guide: { title: "محصولات", section: "کاتالوگ", description: "همه محصولات، قیمت، موجودی و وضعیت نمایش آن‌ها در فروشگاه را مدیریت کن.", steps: ["محصول را جست‌وجو کن", "وضعیت و موجودی را بررسی کن", "برای جزئیات وارد ویرایش شو"] } },
  { match: (p) => p.startsWith("/admin/inventory"), guide: { title: "انبار و موجودی", section: "کاتالوگ", description: "موجودی قابل فروش، رزرو سفارش‌ها و تاریخچه تغییرات انبار را کنترل کن.", steps: ["کالاهای کم‌موجود را پیدا کن", "تعداد صحیح را ثبت کن", "علت تغییر را در تاریخچه بررسی کن"] } },
  { match: (p) => p.startsWith("/admin/brands"), guide: { title: "مدیریت برند", section: "کاتالوگ", description: "سازندگان محصولات و اطلاعات معرفی هر برند را بساز یا ویرایش کن.", steps: ["نام و شناسه برند را وارد کن", "کشور و معرفی را کامل کن", "ذخیره و در محصول استفاده کن"] } },
  { match: (p) => p.startsWith("/admin/categories"), guide: { title: "مدیریت دسته‌بندی", section: "کاتالوگ", description: "ساختار دسترسی مشتری به محصولات را با دسته‌ها و زیردسته‌های روشن تنظیم کن.", steps: ["عنوان و شناسه را مشخص کن", "در صورت نیاز دسته والد را انتخاب کن", "ذخیره و محصولات مرتبط را بررسی کن"] } },
  { match: (p) => p.startsWith("/admin/ingredients"), guide: { title: "مدیریت ترکیبات", section: "کاتالوگ", description: "مواد مؤثره محصولات را تعریف کن تا پیشنهادهای هوشمند برای مشتری قابل توضیح باشند.", steps: ["نام ترکیب را ثبت کن", "کاربرد آن را ساده توضیح بده", "ترکیب را به محصولات مرتبط کن"] } },
  { match: (p) => p.startsWith("/admin/orders"), guide: { title: "سفارش‌ها", section: "فروش", description: "پرداخت، آدرس، اقلام و مسیر آماده‌سازی تا تحویل هر سفارش را مدیریت کن.", steps: ["رسیدهای منتظر را بررسی کن", "سفارش را آماده و ارسال کن", "وضعیت نهایی را ثبت کن"] } },
  { match: (p) => p.startsWith("/admin/customers"), guide: { title: "مشتریان", section: "فروش", description: "سوابق خرید، اطلاعات حساب، برچسب‌ها و وضعیت دسترسی مشتریان را ببین.", steps: ["مشتری را جست‌وجو کن", "سابقه و یادداشت‌ها را بخوان", "برچسب یا وضعیت حساب را اصلاح کن"] } },
  { match: (p) => p.startsWith("/admin/payment-settings"), guide: { title: "تنظیمات پرداخت", section: "فروش", description: "اطلاعات پرداخت دستی و متنی که مشتری هنگام پرداخت می‌بیند را تنظیم کن.", steps: ["اطلاعات حساب را بررسی کن", "راهنمای پرداخت را بنویس", "ذخیره و صفحه پرداخت را آزمایش کن"] } },
  { match: (p) => p.startsWith("/admin/shipping"), guide: { title: "روش‌های ارسال", section: "فروش", description: "هزینه، زمان تحویل و شرایط ارسال رایگان را برای هر روش تعیین کن.", steps: ["روش ارسال را بساز", "هزینه و بازه تحویل را وارد کن", "روش‌های فعال را مرتب و آزمایش کن"] } },
  { match: (p) => p.startsWith("/admin/discounts"), guide: { title: "کدهای تخفیف", section: "فروش", description: "کمپین‌های تخفیف، محدودیت مصرف و زمان اعتبار آن‌ها را کنترل کن.", steps: ["نوع و مقدار تخفیف را تعیین کن", "محدودیت و تاریخ را تنظیم کن", "کد را فعال و در سبد خرید تست کن"] } },
  { match: (p) => p.startsWith("/admin/reviews"), guide: { title: "نظرات مشتریان", section: "فروش", description: "تجربه‌های ثبت‌شده را بررسی، تأیید یا رد کن و پاسخ رسمی فروشگاه را بنویس.", steps: ["نظرات منتظر را بخوان", "محتوا را تأیید یا رد کن", "در صورت نیاز پاسخ مدیر را ثبت کن"] } },
  { match: (p) => p.startsWith("/admin/homepage"), guide: { title: "صفحه اصلی", section: "ویترین سایت", description: "Hero، ویدیو، پوسترها، بنرها و بخش‌های محصول صفحه اول را بدون کدنویسی مدیریت کن.", steps: ["رسانه و متن کمپین را انتخاب کن", "پیش‌نمایش موبایل و دسکتاپ را ببین", "ذخیره و صفحه اصلی را بازبینی کن"] } },
  { match: (p) => p.startsWith("/admin/header"), guide: { title: "هدر، لوگو و فوتر", section: "ویترین سایت", description: "منوهای اصلی، لوگو، نوار اطلاع‌رسانی و اطلاعات پایین سایت را تنظیم کن.", steps: ["هویت و لوگو را تنظیم کن", "لینک‌های منو را مرتب کن", "هدر و فوتر را در موبایل بررسی کن"] } },
  { match: (p) => p.startsWith("/admin/media"), guide: { title: "کتابخانه رسانه", section: "ویترین سایت", description: "تصاویر و ویدیوهای قابل استفاده در محصولات و کمپین‌های سایت را آپلود و جایگزین کن.", steps: ["فایل مناسب را انتخاب کن", "حجم و پیش‌نمایش را بررسی کن", "رسانه را در بخش موردنظر استفاده کن"] } },
  { match: (p) => p.startsWith("/admin/seo"), guide: { title: "سئو و گوگل", section: "تنظیمات", description: "عنوان، توضیح، دامنه و دسترسی موتورهای جست‌وجو به فروشگاه را مدیریت کن.", steps: ["دامنه و عنوان پیش‌فرض را وارد کن", "توضیح و لوگوی اشتراک را کامل کن", "پس از انتشار ایندکس را فعال کن"] } },
  { match: (p) => p.startsWith("/admin/store-settings"), guide: { title: "تنظیمات فروشگاه", section: "تنظیمات", description: "اطلاعات پایه، راه‌های ارتباطی و قواعد عمومی کسب‌وکار را از یک محل تغییر بده.", steps: ["اطلاعات برند را بررسی کن", "راه‌های تماس را تکمیل کن", "ذخیره و خروجی عمومی را کنترل کن"] } }
];

function currentGuide(pathname: string) {
  return guides.find((item) => item.match(pathname))?.guide ?? guides[0].guide;
}

export function AdminTopbar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const guide = currentGuide(pathname);
  return (
    <header className="admin-topbar">
      <div className="admin-breadcrumb"><span>{guide.section}</span><CaretLeft size={13} /><strong>{guide.title}</strong></div>
      <form className="admin-global-search" action="/admin/products">
        <MagnifyingGlass size={17} aria-hidden="true" />
        <input name="q" placeholder="جست‌وجوی محصول..." aria-label="جست‌وجوی محصول" />
        <kbd>⌘ K</kbd>
      </form>
      <div className="admin-top-actions">
        <a href="/admin/reviews" title="موارد نیازمند بررسی" aria-label="موارد نیازمند بررسی"><Bell size={19} /></a>
        <a href="/" title="مشاهده فروشگاه" aria-label="مشاهده فروشگاه"><Storefront size={19} /></a>
        <span className="admin-top-user" title={displayName}>{displayName.charAt(0) || "م"}</span>
      </div>
    </header>
  );
}

export function AdminPageGuide() {
  const pathname = usePathname();
  const guide = currentGuide(pathname);
  return (
    <details className="admin-context-guide">
      <summary><span><Question size={18} weight="duotone" /><strong>راهنمای این صفحه</strong><small>{guide.description}</small></span><span>مشاهده مراحل</span></summary>
      <ol>{guide.steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol>
    </details>
  );
}
