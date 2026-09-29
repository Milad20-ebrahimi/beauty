import "server-only";
import { prisma } from "@/lib/prisma";

export const STORE_DEFAULTS = {
  id: "default",
  storeName: "BeautyOS",
  tagline: "انتخاب زیبایی، براساس خودت",
  logoUrl: null,
  supportPhone: null,
  supportEmail: null,
  supportHours: null,
  address: null,
  instagramUrl: null,
  telegramUrl: null,
  whatsappUrl: null,
  announcementText: null,
  announcementLink: null,
  announcementActive: false,
  footerAbout: "فروشگاه هوشمند زیبایی برای انتخاب محصول متناسب با پوست، نیاز و بودجه تو.",
  shippingNotice: null,
  updatedAt: new Date(0)
};

export async function getStoreSettings() {
  return (await prisma.storeSettings.findUnique({ where: { id: "default" } })) || STORE_DEFAULTS;
}
