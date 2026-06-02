-- Keep migration history aligned with the current ExerciseKind enum.
ALTER TYPE "ExerciseKind" ADD VALUE IF NOT EXISTS 'TEACH';

-- Premium validity on the account itself.
ALTER TABLE "user"
  ADD COLUMN "premiumUntil" TIMESTAMP(3),
  ADD COLUMN "premiumAssignedAt" TIMESTAMP(3),
  ADD COLUMN "premiumNote" TEXT;

-- Auditable manual grants/revocations for Premium V1.
CREATE TABLE "premium_grants" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "adminUserId" TEXT,
  "plan" "SubscriptionPlan" NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "premium_grants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "premium_grants_userId_createdAt_idx" ON "premium_grants"("userId", "createdAt");
CREATE INDEX "premium_grants_adminUserId_idx" ON "premium_grants"("adminUserId");

ALTER TABLE "premium_grants"
  ADD CONSTRAINT "premium_grants_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "premium_grants"
  ADD CONSTRAINT "premium_grants_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "user"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
