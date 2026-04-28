-- CreateEnum
CREATE TYPE "CompanyDraftStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CompanyProfileDraft" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "status" "CompanyDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB NOT NULL,
    "submittedByName" TEXT,
    "submittedByEmail" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfileDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyProfileDraft_workspaceId_status_updatedAt_idx" ON "CompanyProfileDraft"("workspaceId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "CompanyProfileDraft_reviewedById_idx" ON "CompanyProfileDraft"("reviewedById");

-- AddForeignKey
ALTER TABLE "CompanyProfileDraft" ADD CONSTRAINT "CompanyProfileDraft_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CompanyWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProfileDraft" ADD CONSTRAINT "CompanyProfileDraft_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
