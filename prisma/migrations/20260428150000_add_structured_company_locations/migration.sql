-- Add structured location/KCN fields while keeping free-text addresses intact.

ALTER TABLE "Client"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "industrialZone" TEXT;

ALTER TABLE "JobOrder"
  ADD COLUMN "industrialZone" TEXT;

ALTER TABLE "Employer"
  ADD COLUMN "location" TEXT,
  ADD COLUMN "industrialZone" TEXT;

CREATE INDEX "Client_location_idx" ON "Client"("location");
CREATE INDEX "Client_industrialZone_idx" ON "Client"("industrialZone");
CREATE INDEX "JobOrder_location_idx" ON "JobOrder"("location");
CREATE INDEX "JobOrder_industrialZone_idx" ON "JobOrder"("industrialZone");
CREATE INDEX "Employer_location_idx" ON "Employer"("location");
CREATE INDEX "Employer_industrialZone_idx" ON "Employer"("industrialZone");

WITH employer_zone_match AS (
  SELECT e."id",
    (
      SELECT oi."value"
      FROM "OptionItem" oi
      LEFT JOIN "OptionAlias" oa ON oa."itemId" = oi."id"
      WHERE oi."setKey" = 'industrialZone'
        AND (
          lower(e."address") = lower(oi."value")
          OR lower(e."address") = lower(oi."label")
          OR (oa."alias" IS NOT NULL AND lower(e."address") = lower(oa."alias"))
          OR lower(e."address") LIKE '%' || lower(oi."value") || '%'
          OR lower(e."address") LIKE '%' || lower(oi."label") || '%'
          OR (oa."alias" IS NOT NULL AND lower(e."address") LIKE '%' || lower(oa."alias") || '%')
        )
      ORDER BY length(COALESCE(oa."alias", oi."label", oi."value")) DESC
      LIMIT 1
    ) AS "value"
  FROM "Employer" e
  WHERE e."address" IS NOT NULL
)
UPDATE "Employer" e
SET "industrialZone" = m."value"
FROM employer_zone_match m
WHERE e."id" = m."id"
  AND e."industrialZone" IS NULL
  AND m."value" IS NOT NULL;

WITH employer_location_match AS (
  SELECT e."id",
    (
      SELECT oi."value"
      FROM "OptionItem" oi
      LEFT JOIN "OptionAlias" oa ON oa."itemId" = oi."id"
      WHERE oi."setKey" = 'location'
        AND (
          lower(e."address") = lower(oi."value")
          OR lower(e."address") = lower(oi."label")
          OR (oa."alias" IS NOT NULL AND lower(e."address") = lower(oa."alias"))
          OR lower(e."address") LIKE '%' || lower(oi."value") || '%'
          OR lower(e."address") LIKE '%' || lower(oi."label") || '%'
          OR (oa."alias" IS NOT NULL AND lower(e."address") LIKE '%' || lower(oa."alias") || '%')
        )
      ORDER BY length(COALESCE(oa."alias", oi."label", oi."value")) DESC
      LIMIT 1
    ) AS "value"
  FROM "Employer" e
  WHERE e."address" IS NOT NULL
)
UPDATE "Employer" e
SET "location" = m."value"
FROM employer_location_match m
WHERE e."id" = m."id"
  AND e."location" IS NULL
  AND m."value" IS NOT NULL;

WITH client_zone_match AS (
  SELECT c."id",
    (
      SELECT oi."value"
      FROM "OptionItem" oi
      LEFT JOIN "OptionAlias" oa ON oa."itemId" = oi."id"
      WHERE oi."setKey" = 'industrialZone'
        AND (
          lower(c."address") = lower(oi."value")
          OR lower(c."address") = lower(oi."label")
          OR (oa."alias" IS NOT NULL AND lower(c."address") = lower(oa."alias"))
          OR lower(c."address") LIKE '%' || lower(oi."value") || '%'
          OR lower(c."address") LIKE '%' || lower(oi."label") || '%'
          OR (oa."alias" IS NOT NULL AND lower(c."address") LIKE '%' || lower(oa."alias") || '%')
        )
      ORDER BY length(COALESCE(oa."alias", oi."label", oi."value")) DESC
      LIMIT 1
    ) AS "value"
  FROM "Client" c
  WHERE c."address" IS NOT NULL
)
UPDATE "Client" c
SET "industrialZone" = m."value"
FROM client_zone_match m
WHERE c."id" = m."id"
  AND c."industrialZone" IS NULL
  AND m."value" IS NOT NULL;

WITH client_location_match AS (
  SELECT c."id",
    (
      SELECT oi."value"
      FROM "OptionItem" oi
      LEFT JOIN "OptionAlias" oa ON oa."itemId" = oi."id"
      WHERE oi."setKey" = 'location'
        AND (
          lower(c."address") = lower(oi."value")
          OR lower(c."address") = lower(oi."label")
          OR (oa."alias" IS NOT NULL AND lower(c."address") = lower(oa."alias"))
          OR lower(c."address") LIKE '%' || lower(oi."value") || '%'
          OR lower(c."address") LIKE '%' || lower(oi."label") || '%'
          OR (oa."alias" IS NOT NULL AND lower(c."address") LIKE '%' || lower(oa."alias") || '%')
        )
      ORDER BY length(COALESCE(oa."alias", oi."label", oi."value")) DESC
      LIMIT 1
    ) AS "value"
  FROM "Client" c
  WHERE c."address" IS NOT NULL
)
UPDATE "Client" c
SET "location" = m."value"
FROM client_location_match m
WHERE c."id" = m."id"
  AND c."location" IS NULL
  AND m."value" IS NOT NULL;
