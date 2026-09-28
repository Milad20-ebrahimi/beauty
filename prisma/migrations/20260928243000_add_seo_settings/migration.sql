CREATE TABLE "SeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'BeautyOS',
    "defaultTitle" TEXT NOT NULL DEFAULT 'BeautyOS | انتخاب هوشمند محصولات زیبایی',
    "titleTemplate" TEXT NOT NULL DEFAULT '%s | BeautyOS',
    "defaultDescription" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "organizationName" TEXT,
    "logoUrl" TEXT,
    "googleVerification" TEXT,
    "allowIndexing" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);
