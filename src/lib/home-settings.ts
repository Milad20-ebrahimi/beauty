import "server-only";
import { prisma } from "@/lib/prisma";

export const HOME_DEFAULTS = {
  id: "default", heroInternalName: "کمپین اصلی", heroEnabled: true, heroMediaType: "VIDEO", heroDesktopImageUrl: null, heroMobileImageUrl: null, heroImageAlt: "کمپین اصلی BeautyOS", heroVideoUrl: null, heroMobileVideoUrl: null, heroPosterUrl: null, heroMobilePosterUrl: null,
  heroMediaFit: "COVER", heroMediaPosition: "CENTER", heroCustomPosition: null, heroTextPosition: "CENTER_RIGHT", heroTextTheme: "LIGHT", heroOverlayEnabled: true, heroOverlayStrength: 20,
  heroEyebrow: "BeautyOS Edit", heroTitle: "زیبایی، با انتخابی که شبیه توست.", heroDescription: "محصولات منتخب، تجربه واقعی و پیشنهاد شخصی؛ برای روتینی که واقعاً به تو می‌آید.",
  heroButtonText: "کشف محصولات", heroButtonLink: "/products", heroPrimaryEnabled: true, heroSecondaryText: "ساخت Beauty Passport", heroSecondaryLink: "/passport", heroSecondaryEnabled: true, heroStartDate: null, heroEndDate: null, heroSortOrder: 0,
  postersEnabled: true, posterOneEnabled: true, posterOneImageUrl: null, posterOneMobileImageUrl: null, posterOneAlt: "کمپین مراقبت روزانه", posterOneKicker: "Daily Ritual", posterOneTitle: "آیین مراقبت روزانه", posterOneDescription: "روتین‌های کوتاه و مؤثر برای صبح و شب.", posterOneButtonText: "مشاهده روتین", posterOneLink: "/routine", posterOneTextPosition: "BOTTOM_RIGHT", posterOneTextTheme: "LIGHT", posterOneOverlayEnabled: true, posterOneOverlayStrength: 25,
  posterTwoEnabled: true, posterTwoImageUrl: null, posterTwoMobileImageUrl: null, posterTwoAlt: "کمپین انتخاب شخصی", posterTwoKicker: "Made For You", posterTwoTitle: "انتخاب دقیق برای پوست تو", posterTwoDescription: "با چند پاسخ ساده، انتخاب‌های مناسب‌تر را پیدا کن.", posterTwoButtonText: "ساخت پاسپورت", posterTwoLink: "/passport", posterTwoTextPosition: "BOTTOM_RIGHT", posterTwoTextTheme: "LIGHT", posterTwoOverlayEnabled: true, posterTwoOverlayStrength: 25,
  newProductsEnabled: true, newProductsTitle: "تازه‌رسیده‌ها", newProductsDescription: "جدیدترین انتخاب‌های BeautyOS",
  bestSellersEnabled: true, bestSellersTitle: "محبوب‌ترین انتخاب‌ها", bestSellersDescription: "محصولاتی که بیشتر از همه خریداری شده‌اند",
  needsEnabled: true, needsTitle: "از نیاز پوستت شروع کن", needsDescription: "سریع‌تر به انتخاب درست برس.",
  passportEnabled: true, passportEyebrow: "Beauty Passport", passportTitle: "فروشگاه باید تو را بشناسد.", passportDescription: "نوع پوست، دغدغه و بودجه‌ات را یک‌بار ثبت کن تا پیشنهادها و روتین‌ها برای خودت ساخته شوند.", passportButtonText: "ساخت پاسپورت زیبایی", passportButtonLink: "/passport", updatedAt: new Date(0)
};

export async function getHomeSettings() {
  return (await prisma.homePageSettings.findUnique({ where: { id: "default" } })) || HOME_DEFAULTS;
}
