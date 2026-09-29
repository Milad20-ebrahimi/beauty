import "server-only";
import { prisma } from "@/lib/prisma";

export const HOME_DEFAULTS = {
  id: "default", heroEnabled: true, heroVideoUrl: null, heroPosterUrl: null,
  heroEyebrow: "BeautyOS Edit", heroTitle: "زیبایی، با انتخابی که شبیه توست.", heroDescription: "محصولات منتخب، تجربه واقعی و پیشنهاد شخصی؛ برای روتینی که واقعاً به تو می‌آید.",
  heroButtonText: "کشف محصولات", heroButtonLink: "/products", heroSecondaryText: "ساخت Beauty Passport", heroSecondaryLink: "/passport",
  postersEnabled: true, posterOneImageUrl: null, posterOneKicker: "Daily Ritual", posterOneTitle: "آیین مراقبت روزانه", posterOneDescription: "روتین‌های کوتاه و مؤثر برای صبح و شب.", posterOneButtonText: "مشاهده روتین", posterOneLink: "/routine",
  posterTwoImageUrl: null, posterTwoKicker: "Made For You", posterTwoTitle: "انتخاب دقیق برای پوست تو", posterTwoDescription: "با چند پاسخ ساده، انتخاب‌های مناسب‌تر را پیدا کن.", posterTwoButtonText: "ساخت پاسپورت", posterTwoLink: "/passport",
  newProductsEnabled: true, newProductsTitle: "تازه‌رسیده‌ها", newProductsDescription: "جدیدترین انتخاب‌های BeautyOS",
  bestSellersEnabled: true, bestSellersTitle: "محبوب‌ترین انتخاب‌ها", bestSellersDescription: "محصولاتی که بیشتر از همه خریداری شده‌اند",
  needsEnabled: true, needsTitle: "از نیاز پوستت شروع کن", needsDescription: "سریع‌تر به انتخاب درست برس.",
  passportEnabled: true, passportEyebrow: "Beauty Passport", passportTitle: "فروشگاه باید تو را بشناسد.", passportDescription: "نوع پوست، دغدغه و بودجه‌ات را یک‌بار ثبت کن تا پیشنهادها و روتین‌ها برای خودت ساخته شوند.", passportButtonText: "ساخت پاسپورت زیبایی", passportButtonLink: "/passport", updatedAt: new Date(0)
};

export async function getHomeSettings() {
  return (await prisma.homePageSettings.findUnique({ where: { id: "default" } })) || HOME_DEFAULTS;
}
