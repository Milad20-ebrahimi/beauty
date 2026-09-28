CREATE TABLE "CustomerOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerOtp_phone_createdAt_idx" ON "CustomerOtp"("phone", "createdAt");
