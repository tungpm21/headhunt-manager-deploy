import { Prisma } from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { ViewerScope } from "@/lib/viewer-scope";

const REMINDER_USER_SELECT = {
  id: true,
  name: true,
} as const;

const REMINDER_CANDIDATE_SELECT = {
  id: true,
  fullName: true,
  currentPosition: true,
} as const;

function withReminderAccess(
  where: Prisma.CandidateReminderWhereInput,
  scope?: ViewerScope
): Prisma.CandidateReminderWhereInput {
  if (!scope || scope.isAdmin) {
    return where;
  }

  return {
    AND: [
      where,
      {
        OR: [
          { assignedToId: scope.userId },
          {
            candidate: {
              createdById: scope.userId,
            },
          },
        ],
      },
    ],
  };
}

export async function createCandidateReminder(input: {
  candidateId: number;
  title: string;
  note?: string | null;
  dueAt: Date;
  assignedToId: number;
}) {
  return prisma.candidateReminder.create({
    data: {
      candidateId: input.candidateId,
      title: input.title,
      note: input.note,
      dueAt: input.dueAt,
      assignedToId: input.assignedToId,
    },
    include: {
      candidate: { select: REMINDER_CANDIDATE_SELECT },
      assignedTo: { select: REMINDER_USER_SELECT },
      completedBy: { select: REMINDER_USER_SELECT },
    },
  });
}

export async function completeCandidateReminder(
  reminderId: number,
  completedById: number,
  scope?: ViewerScope
) {
  const existingReminder = await prisma.candidateReminder.findFirst({
    where: withReminderAccess({ id: reminderId }, scope),
    include: {
      candidate: { select: REMINDER_CANDIDATE_SELECT },
      assignedTo: { select: REMINDER_USER_SELECT },
      completedBy: { select: REMINDER_USER_SELECT },
    },
  });

  if (!existingReminder) {
    return null;
  }

  if (existingReminder.isCompleted) {
    return {
      reminder: existingReminder,
      justCompleted: false,
    };
  }

  const reminder = await prisma.candidateReminder.update({
    where: { id: reminderId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      completedById,
    },
    include: {
      candidate: { select: REMINDER_CANDIDATE_SELECT },
      assignedTo: { select: REMINDER_USER_SELECT },
      completedBy: { select: REMINDER_USER_SELECT },
    },
  });

  return {
    reminder,
    justCompleted: true,
  };
}

export async function getUpcomingCandidateReminders(
  referenceDate = new Date(),
  limit = 8,
  scope?: ViewerScope
) {
  return prisma.candidateReminder.findMany({
    where: withReminderAccess(
      {
        isCompleted: false,
        dueAt: {
          lte: addDays(referenceDate, 7),
        },
      },
      scope
    ),
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      candidate: { select: REMINDER_CANDIDATE_SELECT },
      assignedTo: { select: REMINDER_USER_SELECT },
    },
  });
}
