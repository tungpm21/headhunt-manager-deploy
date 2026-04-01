UPDATE "Application"
SET "email" = LOWER(BTRIM("email"))
WHERE "email" <> LOWER(BTRIM("email"));

CREATE UNIQUE INDEX "Application_jobPostingId_email_key"
ON "Application"("jobPostingId", "email");
