CREATE TYPE "OptionValueType" AS ENUM ('STRING', 'ENUM');

CREATE TABLE "OptionSet" (
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "valueType" "OptionValueType" NOT NULL DEFAULT 'STRING',
  "allowCustomValues" BOOLEAN NOT NULL DEFAULT true,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OptionSet_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "OptionItem" (
  "id" SERIAL NOT NULL,
  "setKey" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "showInPublic" BOOLEAN NOT NULL DEFAULT false,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OptionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OptionAlias" (
  "id" SERIAL NOT NULL,
  "itemId" INTEGER NOT NULL,
  "setKey" TEXT NOT NULL,
  "alias" TEXT NOT NULL,
  "normalizedAlias" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OptionAlias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OptionItem_setKey_value_key" ON "OptionItem"("setKey", "value");
CREATE INDEX "OptionItem_setKey_isActive_sortOrder_idx" ON "OptionItem"("setKey", "isActive", "sortOrder");
CREATE UNIQUE INDEX "OptionAlias_setKey_normalizedAlias_key" ON "OptionAlias"("setKey", "normalizedAlias");
CREATE INDEX "OptionAlias_itemId_idx" ON "OptionAlias"("itemId");

ALTER TABLE "OptionItem"
  ADD CONSTRAINT "OptionItem_setKey_fkey"
  FOREIGN KEY ("setKey") REFERENCES "OptionSet"("key")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OptionAlias"
  ADD CONSTRAINT "OptionAlias_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "OptionItem"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
