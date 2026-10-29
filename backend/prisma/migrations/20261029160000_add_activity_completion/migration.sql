-- CreateTable
CREATE TABLE "ActivityCompletion" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityCompletion_learnerId_idx" ON "ActivityCompletion"("learnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityCompletion_learnerId_activityId_key" ON "ActivityCompletion"("learnerId", "activityId");

-- AddForeignKey
ALTER TABLE "ActivityCompletion" ADD CONSTRAINT "ActivityCompletion_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityCompletion" ADD CONSTRAINT "ActivityCompletion_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
