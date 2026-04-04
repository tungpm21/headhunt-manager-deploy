ALTER TABLE "JobPosting"
ADD COLUMN "skills_new" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "JobPosting"
SET "skills_new" = CASE
  WHEN "skills" IS NULL OR btrim("skills") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY(
    SELECT DISTINCT trimmed_skill
    FROM (
      SELECT btrim(raw_skill) AS trimmed_skill
      FROM unnest(string_to_array("skills", ',')) AS raw_skill
    ) normalized_skills
    WHERE trimmed_skill <> ''
  )
END;

ALTER TABLE "JobPosting" DROP COLUMN "skills";
ALTER TABLE "JobPosting" RENAME COLUMN "skills_new" TO "skills";
