-- CreateEnum
CREATE TYPE "NotificationRecipientKind" AS ENUM ('ADMIN', 'COMPANY');

-- CreateEnum
CREATE TYPE "NotificationEventType" AS ENUM (
    'COMPANY_PROFILE_DRAFT_APPROVED',
    'COMPANY_PROFILE_DRAFT_REJECTED',
    'FDIWORK_APPLICATION_IMPORTED',
    'JOB_POSTING_APPROVED',
    'JOB_POSTING_REJECTED',
    'SUBMISSION_FEEDBACK_RECEIVED',
    'QUOTA_ALERT',
    'SUBSCRIPTION_ALERT'
);

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'DANGER');

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" SERIAL NOT NULL,
    "recipientKind" "NotificationRecipientKind" NOT NULL,
    "adminUserId" INTEGER,
    "portalUserId" INTEGER,
    "workspaceId" INTEGER,
    "type" "NotificationEventType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationEvent_recipientKind_adminUserId_readAt_createdAt_idx" ON "NotificationEvent"("recipientKind", "adminUserId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_recipientKind_portalUserId_readAt_createdAt_idx" ON "NotificationEvent"("recipientKind", "portalUserId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_workspaceId_readAt_createdAt_idx" ON "NotificationEvent"("workspaceId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEvent_adminUserId_type_entityType_entityId_key" ON "NotificationEvent"("adminUserId", "type", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEvent_portalUserId_type_entityType_entityId_key" ON "NotificationEvent"("portalUserId", "type", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "CompanyPortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "CompanyWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
