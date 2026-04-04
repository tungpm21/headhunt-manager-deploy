CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_candidate_fullname_trgm
ON "Candidate"
USING GIN (lower("fullName") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_candidate_email_trgm
ON "Candidate"
USING GIN (lower("email") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_candidate_phone_trgm
ON "Candidate"
USING GIN (lower("phone") gin_trgm_ops);
