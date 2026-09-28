CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Review" ADD COLUMN "orderItemId" TEXT,
ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "adminReply" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

UPDATE "Review" SET "status" = 'APPROVED' WHERE "source" = 'IMPORTED';

CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
