CREATE TABLE "HeaderSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "announcementActive" BOOLEAN NOT NULL DEFAULT true,
    "announcementText" TEXT NOT NULL DEFAULT 'ارسال رایگان برای سفارش‌های منتخب',
    "announcementLink" TEXT,
    "announcementLinkText" TEXT,
    "announcementBackground" TEXT NOT NULL DEFAULT '#D8A7B1',
    "announcementColor" TEXT NOT NULL DEFAULT '#4A1729',
    "navItems" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderSettings_pkey" PRIMARY KEY ("id")
);
