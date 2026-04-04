-- CreateIndex
CREATE INDEX "idx_candidate_skills" ON "Candidate" USING GIN ("skills");

-- CreateIndex
CREATE INDEX "idx_job_required_skills" ON "JobOrder" USING GIN ("requiredSkills");
