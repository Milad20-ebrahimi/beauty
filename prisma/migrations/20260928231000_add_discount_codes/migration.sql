CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minimumSubtotal" INTEGER NOT NULL DEFAULT 0,
    "maximumDiscount" INTEGER,
    "usageLimit" INTEGER,
    "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "productId" TEXT,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscountUsage" (
    "id" TEXT NOT NULL,
    "discountCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscountUsage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order" ADD COLUMN "discountCodeId" TEXT,
ADD COLUMN "discountCodeText" TEXT;

CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
CREATE INDEX "DiscountCode_active_startsAt_expiresAt_idx" ON "DiscountCode"("active", "startsAt", "expiresAt");
CREATE INDEX "DiscountCode_productId_idx" ON "DiscountCode"("productId");
CREATE INDEX "DiscountCode_categoryId_idx" ON "DiscountCode"("categoryId");
CREATE UNIQUE INDEX "DiscountUsage_orderId_key" ON "DiscountUsage"("orderId");
CREATE INDEX "DiscountUsage_discountCodeId_createdAt_idx" ON "DiscountUsage"("discountCodeId", "createdAt");
CREATE INDEX "DiscountUsage_userId_discountCodeId_idx" ON "DiscountUsage"("userId", "discountCodeId");
CREATE INDEX "Order_discountCodeId_idx" ON "Order"("discountCodeId");

ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
