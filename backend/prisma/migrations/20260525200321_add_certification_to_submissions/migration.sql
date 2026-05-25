-- AlterTable
ALTER TABLE "QuizSubmission" ADD COLUMN     "certificationId" TEXT,
ALTER COLUMN "quizId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "QuizSubmission_learnerId_certificationId_idx" ON "QuizSubmission"("learnerId", "certificationId");

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
