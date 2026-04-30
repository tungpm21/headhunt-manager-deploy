"use client";

import { useState } from "react";
import { Briefcase, FileText, Languages } from "lucide-react";
import type { CandidateWithRelations } from "@/types/candidate-ui";
import { CvList } from "@/components/candidates/cv-list";
import { LanguageList } from "@/components/candidates/language-list";
import { WorkHistory } from "@/components/candidates/work-history";

type TabKey = "cv" | "languages" | "experience";

interface CandidateDetailTabsProps {
  candidateId: number;
  cvFiles: CandidateWithRelations["cvFiles"];
  legacyCvFileUrl?: string | null;
  legacyCvFileName?: string | null;
  languages: CandidateWithRelations["languages"];
  workHistory: CandidateWithRelations["workHistory"];
}

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof FileText;
}[] = [
  { key: "cv", label: "CV", icon: FileText },
  { key: "languages", label: "Ngôn ngữ", icon: Languages },
  { key: "experience", label: "Kinh nghiệm", icon: Briefcase },
];

export function CandidateDetailTabs({
  candidateId,
  cvFiles,
  legacyCvFileUrl,
  legacyCvFileName,
  languages,
  workHistory,
}: CandidateDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("cv");

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="border-b border-border bg-muted/10 p-2">
        <div className="grid grid-cols-3 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-background text-foreground hover:bg-primary/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        {activeTab === "cv" && (
          <CvList
            candidateId={candidateId}
            cvFiles={cvFiles}
            legacyCvFileUrl={legacyCvFileUrl}
            legacyCvFileName={legacyCvFileName}
          />
        )}
        {activeTab === "languages" && (
          <LanguageList candidateId={candidateId} languages={languages} />
        )}
        {activeTab === "experience" && (
          <WorkHistory candidateId={candidateId} workHistory={workHistory} />
        )}
      </div>
    </div>
  );
}
