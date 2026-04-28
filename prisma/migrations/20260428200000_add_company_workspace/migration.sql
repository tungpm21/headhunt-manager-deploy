-- CreateEnum
CREATE TYPE "CompanyWorkspaceStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CompanyPortalRole" AS ENUM ('OWNER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SubmissionFeedbackDecision" AS ENUM ('INTERESTED', 'NEED_MORE_INFO', 'INTERVIEW', 'REJECTED');

-- CreateTable
CREATE TABLE "CompanyWorkspace" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CompanyWorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "portalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "employerId" INTEGER,
    "clientId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPortalUser" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "CompanyPortalRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionFeedback" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "jobCandidateId" INTEGER NOT NULL,
    "authorPortalUserId" INTEGER,
    "decision" "SubmissionFeedbackDecision",
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWorkspace_slug_key" ON "CompanyWorkspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWorkspace_employerId_key" ON "CompanyWorkspace"("employerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWorkspace_clientId_key" ON "CompanyWorkspace"("clientId");

-- CreateIndex
CREATE INDEX "CompanyWorkspace_status_idx" ON "CompanyWorkspace"("status");

-- CreateIndex
CREATE INDEX "CompanyPortalUser_email_idx" ON "CompanyPortalUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPortalUser_workspaceId_email_key" ON "CompanyPortalUser"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "SubmissionFeedback_workspaceId_createdAt_idx" ON "SubmissionFeedback"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "SubmissionFeedback_jobCandidateId_createdAt_idx" ON "SubmissionFeedback"("jobCandidateId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyWorkspace" ADD CONSTRAINT "CompanyWorkspace_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyWorkspace" ADD CONSTRAINT "CompanyWorkspace_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPortalUser" ADD CONSTRAINT "CompanyPortalUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CompanyWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFeedback" ADD CONSTRAINT "SubmissionFeedback_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CompanyWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFeedback" ADD CONSTRAINT "SubmissionFeedback_jobCandidateId_fkey" FOREIGN KEY ("jobCandidateId") REFERENCES "JobCandidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFeedback" ADD CONSTRAINT "SubmissionFeedback_authorPortalUserId_fkey" FOREIGN KEY ("authorPortalUserId") REFERENCES "CompanyPortalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
