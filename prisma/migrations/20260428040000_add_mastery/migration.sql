-- CreateTable
CREATE TABLE "mastery" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mastery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mastery_childId_exerciseId_key" ON "mastery"("childId", "exerciseId");

-- CreateIndex
CREATE INDEX "mastery_childId_nextReviewAt_idx" ON "mastery"("childId", "nextReviewAt");

-- AddForeignKey
ALTER TABLE "mastery" ADD CONSTRAINT "mastery_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery" ADD CONSTRAINT "mastery_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
