DO $$
BEGIN
  IF to_regclass('public."OptionAlias"') IS NOT NULL THEN
    DELETE FROM "OptionAlias"
    WHERE "setKey" = 'visaSupport';
  END IF;

  IF to_regclass('public."OptionItem"') IS NOT NULL THEN
    DELETE FROM "OptionItem"
    WHERE "setKey" = 'visaSupport';
  END IF;

  IF to_regclass('public."OptionSet"') IS NOT NULL THEN
    DELETE FROM "OptionSet"
    WHERE "key" = 'visaSupport';
  END IF;
END $$;

ALTER TABLE "JobPosting"
DROP COLUMN IF EXISTS "visaSupport";
