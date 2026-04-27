-- Add rich content surfaces for FDIWork public pages.

CREATE TABLE "EmployerProfileConfig" (
  "id" SERIAL NOT NULL,
  "employerId" INTEGER NOT NULL,
  "theme" JSONB,
  "capabilities" JSONB,
  "sections" JSONB,
  "primaryVideoUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmployerProfileConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployerProfileConfig_employerId_key" ON "EmployerProfileConfig"("employerId");

ALTER TABLE "EmployerProfileConfig"
  ADD CONSTRAINT "EmployerProfileConfig_employerId_fkey"
  FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobPosting"
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "coverAlt" TEXT;

ALTER TABLE "BlogPost"
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "coverAlt" TEXT,
  ADD COLUMN "contentBlocks" JSONB;
