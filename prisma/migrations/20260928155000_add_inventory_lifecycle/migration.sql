CREATE TYPE "InventoryMovementType" AS ENUM ('ADJUSTMENT', 'RESERVATION', 'RELEASE', 'SALE', 'RETURN');

ALTER TABLE "Order" ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "inventoryFinalizedAt" TIMESTAMP(3);

UPDATE "Order" SET "expiresAt" = "createdAt" + INTERVAL '24 hours'
WHERE "status" = 'PENDING_PAYMENT' AND "expiresAt" IS NULL;

CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "InventoryMovementType" NOT NULL,
    "stockDelta" INTEGER NOT NULL DEFAULT 0,
    "reservedDelta" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");
CREATE INDEX "InventoryMovement_orderId_idx" ON "InventoryMovement"("orderId");
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
