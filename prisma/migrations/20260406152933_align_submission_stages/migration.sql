-- Step 1: Add new enum values to JobCandidateStage
ALTER TYPE "JobCandidateStage" ADD VALUE IF NOT EXISTS 'SENT_TO_CLIENT';
ALTER TYPE "JobCandidateStage" ADD VALUE IF NOT EXISTS 'CLIENT_REVIEWING';
ALTER TYPE "JobCandidateStage" ADD VALUE IF NOT EXISTS 'FINAL_INTERVIEW';
ALTER TYPE "JobCandidateStage" ADD VALUE IF NOT EXISTS 'HIRED';

-- Step 2: Convert existing data from old enum values to new ones
-- (Each statement is safe — no-op if no matching rows exist)
UPDATE "JobCandidate" SET "stage" = 'SENT_TO_CLIENT' WHERE "stage" = 'SOURCED';
UPDATE "JobCandidate" SET "stage" = 'CLIENT_REVIEWING' WHERE "stage" = 'CONTACTED';
UPDATE "JobCandidate" SET "stage" = 'HIRED' WHERE "stage" = 'PLACED';

-- Step 3: Change default value to new enum value
ALTER TABLE "JobCandidate" ALTER COLUMN "stage" SET DEFAULT 'SENT_TO_CLIENT'::"JobCandidateStage";

-- Step 4: Remove old enum values
-- PostgreSQL doesn't support DROP VALUE directly on enums.
-- We rename the old type, create a new one, convert the column, and drop the old type.
ALTER TYPE "JobCandidateStage" RENAME TO "JobCandidateStage_old";

CREATE TYPE "JobCandidateStage" AS ENUM ('SENT_TO_CLIENT', 'CLIENT_REVIEWING', 'INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');

-- Drop default temporarily so we can alter column type
ALTER TABLE "JobCandidate" ALTER COLUMN "stage" DROP DEFAULT;

ALTER TABLE "JobCandidate"
  ALTER COLUMN "stage" TYPE "JobCandidateStage"
  USING ("stage"::text::"JobCandidateStage");

-- Re-add default with new type
ALTER TABLE "JobCandidate" ALTER COLUMN "stage" SET DEFAULT 'SENT_TO_CLIENT';

-- Clean up old type
DROP TYPE "JobCandidateStage_old";
