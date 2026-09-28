ALTER TABLE "Order" ADD COLUMN "shippingMethodId" TEXT,
ADD COLUMN "shippingMethodTitle" TEXT,
ADD COLUMN "shippingEstimate" TEXT;

CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "freeAbove" INTEGER,
    "estimatedDays" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShippingMethod_active_sortOrder_idx" ON "ShippingMethod"("active", "sortOrder");
CREATE INDEX "Order_shippingMethodId_idx" ON "Order"("shippingMethodId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ShippingMethod" ("id", "title", "description", "price", "freeAbove", "estimatedDays", "active", "sortOrder", "updatedAt")
VALUES ('default-standard-shipping', 'ارسال استاندارد', 'روش پیش‌فرض برای شروع فروشگاه', 0, NULL, '۳ تا ۷ روز کاری', true, 0, CURRENT_TIMESTAMP);
