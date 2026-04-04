import type { CandidateWithTags } from "@/types/candidate-ui";

function escapeCsvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function exportCandidatesToCSV(candidates: CandidateWithTags[]) {
  const headers = [
    "Họ tên",
    "Email",
    "SĐT",
    "Vị trí hiện tại",
    "Công ty",
    "Level",
    "Skills",
  ];

  const rows = candidates.map((candidate) => [
    candidate.fullName,
    candidate.email,
    candidate.phone,
    candidate.currentPosition,
    candidate.currentCompany,
    candidate.level,
    candidate.skills.join(", "),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
