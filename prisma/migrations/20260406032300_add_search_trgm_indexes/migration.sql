-- Add GIN trigram indexes for ILIKE search acceleration
-- on tables not yet covered by existing migration

-- Client: companyName is searched in global-search, clients list, jobs
CREATE INDEX IF NOT EXISTS idx_client_companyname_trgm
ON "Client"
USING GIN (lower("companyName") gin_trgm_ops);

-- JobOrder: title is searched in global-search, jobs list
CREATE INDEX IF NOT EXISTS idx_joborder_title_trgm
ON "JobOrder"
USING GIN (lower("title") gin_trgm_ops);

-- Employer: companyName is searched in global-search, employers list
CREATE INDEX IF NOT EXISTS idx_employer_companyname_trgm
ON "Employer"
USING GIN (lower("companyName") gin_trgm_ops);

-- JobPosting: title + description searched in public job listing
CREATE INDEX IF NOT EXISTS idx_jobposting_title_trgm
ON "JobPosting"
USING GIN (lower("title") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_jobposting_description_trgm
ON "JobPosting"
USING GIN (lower("description") gin_trgm_ops);
