ALTER TABLE "User" ADD COLUMN "customerNote" TEXT,
ADD COLUMN "customerTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "blockedAt" TIMESTAMP(3);

CREATE INDEX "User_role_blockedAt_idx" ON "User"("role", "blockedAt");
