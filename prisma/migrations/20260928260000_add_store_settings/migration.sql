CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'BeautyOS',
    "tagline" TEXT NOT NULL DEFAULT 'انتخاب زیبایی، براساس خودت',
    "logoUrl" TEXT,
    "supportPhone" TEXT,
    "supportEmail" TEXT,
    "supportHours" TEXT,
    "address" TEXT,
    "instagramUrl" TEXT,
    "telegramUrl" TEXT,
    "whatsappUrl" TEXT,
    "announcementText" TEXT,
    "announcementLink" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "footerAbout" TEXT,
    "shippingNotice" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
