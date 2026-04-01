-- CreateEnum
CREATE TYPE "CandidateSeniority" AS ENUM ('INTERN', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SubmissionResult" AS ENUM ('PENDING', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "level" "CandidateSeniority",
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "JobCandidate" ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "result" "SubmissionResult" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "JobOrder" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "openDate" TIMESTAMP(3),
ADD COLUMN     "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "requiredSkills" TEXT[];

-- CreateIndex
CREATE INDEX "Candidate_level_idx" ON "Candidate"("level");

-- CreateIndex
CREATE INDEX "JobOrder_priority_idx" ON "JobOrder"("priority");

-- CreateIndex
CREATE INDEX "JobOrder_industry_idx" ON "JobOrder"("industry");
