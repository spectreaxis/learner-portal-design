-- Issuing a certificate now fixes the recipient's name and signs the record,
-- so renaming a profile no longer renames certificates. Existing certificates
-- are issued (and signed) by the API the first time they are viewed or verified.
-- Additive only, so the previous release keeps working against this schema
-- (safe rollback); "verificationUrl" is dropped in a later release.
ALTER TABLE "Certificate" ADD COLUMN "recipientName" TEXT,
ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "signature" TEXT;

-- CreateTable
CREATE TABLE "CertificateNameChange" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "previousName" TEXT NOT NULL,
    "newName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateNameChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CertificateNameChange_certificateId_idx" ON "CertificateNameChange"("certificateId");

-- AddForeignKey
ALTER TABLE "CertificateNameChange" ADD CONSTRAINT "CertificateNameChange_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
