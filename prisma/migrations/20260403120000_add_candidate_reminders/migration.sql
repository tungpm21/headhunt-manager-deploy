-- DropIndex
DROP INDEX "idx_candidate_skills";

-- DropIndex
DROP INDEX "idx_job_required_skills";

-- CreateTable
CREATE TABLE "CandidateReminder" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "completedById" INTEGER,

    CONSTRAINT "CandidateReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateReminder_candidateId_dueAt_idx" ON "CandidateReminder"("candidateId", "dueAt");

-- CreateIndex
CREATE INDEX "CandidateReminder_assignedToId_isCompleted_dueAt_idx" ON "CandidateReminder"("assignedToId", "isCompleted", "dueAt");

-- CreateIndex
CREATE INDEX "CandidateReminder_isCompleted_dueAt_idx" ON "CandidateReminder"("isCompleted", "dueAt");

-- AddForeignKey
ALTER TABLE "CandidateReminder" ADD CONSTRAINT "CandidateReminder_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateReminder" ADD CONSTRAINT "CandidateReminder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateReminder" ADD CONSTRAINT "CandidateReminder_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
