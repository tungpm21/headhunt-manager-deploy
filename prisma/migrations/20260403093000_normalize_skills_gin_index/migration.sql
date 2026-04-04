UPDATE "Candidate"
SET "skills" = array(
  SELECT DISTINCT lower(trim(s))
  FROM unnest("skills") AS s
);

CREATE INDEX idx_candidate_skills ON "Candidate" USING GIN ("skills");

CREATE INDEX idx_job_required_skills ON "JobOrder" USING GIN ("requiredSkills");
