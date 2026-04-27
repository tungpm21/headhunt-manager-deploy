import { Suspense } from "react";
import { ApplySuccessClient } from "./ApplySuccessClient";

export const metadata = {
  title: "Ứng tuyển thành công",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplySuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobTitle = typeof params.job === "string" ? params.job : "vị trí này";
  const companyName = typeof params.company === "string" ? params.company : "";

  return (
    <Suspense
      fallback={
        <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)] flex items-center justify-center px-4">
          <div className="h-48 w-full max-w-md animate-pulse rounded-xl bg-white" />
        </div>
      }
    >
      <ApplySuccessClient jobTitle={jobTitle} companyName={companyName} />
    </Suspense>
  );
}
