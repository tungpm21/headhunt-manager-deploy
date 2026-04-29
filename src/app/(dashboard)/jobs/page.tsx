import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  Briefcase,
  FileDown,
  ListChecks,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { getJobs } from "@/lib/jobs";
import {
  getApplicationsForImport,
  getPendingJobPostings,
} from "@/lib/moderation-actions";
import type { JobPostingLinkState } from "@/lib/moderation";
import { JobTable } from "@/components/jobs/job-table";
import { JobFiltersPanel } from "@/components/jobs/job-filters";
import { JobPostingModerationPanel } from "@/components/jobs/job-posting-moderation-panel";
import { Pagination } from "@/components/ui/pagination";
import { getAdminJobOrderLinkOptions } from "@/lib/admin-job-posting-actions";
import { ApplicationTable } from "@/app/(dashboard)/moderation/applications/application-table";
import { JobCandidateStage, JobStatus } from "@/types/job";

type RecruitmentTab = "orders" | "posts" | "applications";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    status?: string;
    stage?: string;
    page?: string;
    postStatus?: string;
    postPage?: string;
    postPageSize?: string;
    postSearch?: string;
    postLink?: string;
    applicationStatus?: string;
    applicationPage?: string;
  }>;
}

export const metadata = {
  title: "Tuyển dụng — Headhunt Manager",
};

function parsePage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function normalizeTab(value: string | undefined, isAdmin: boolean): RecruitmentTab {
  if (value === "posts" || value === "applications") {
    return isAdmin ? value : "orders";
  }

  return "orders";
}

function normalizePostLink(value: string | undefined): JobPostingLinkState {
  return value === "LINKED" || value === "UNLINKED" ? value : "ALL";
}

function normalizePostPageSize(value: string | undefined) {
  const pageSize = Number.parseInt(value ?? "25", 10);
  return [25, 50, 100].includes(pageSize) ? pageSize : 25;
}

function RecruitmentTabs({
  activeTab,
  isAdmin,
}: {
  activeTab: RecruitmentTab;
  isAdmin: boolean;
}) {
  const tabs: Array<{
    value: RecruitmentTab;
    label: string;
    href: string;
    icon: typeof Briefcase;
  }> = [
    {
      value: "orders",
      label: "Yêu cầu tuyển dụng",
      href: "/jobs?tab=orders",
      icon: Briefcase,
    },
  ];

  if (isAdmin) {
    tabs.push(
      {
        value: "posts",
        label: "Bài đăng FDIWork",
        href: "/jobs?tab=posts",
        icon: ShieldCheck,
      },
      {
        value: "applications",
        label: "Ứng viên FDIWork",
        href: "/jobs?tab=applications",
        icon: FileDown,
      }
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-1.5 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={
              isActive
                ? "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                : "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-background hover:text-foreground"
            }
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function ApplicationStatusFilters({
  status,
}: {
  status: string;
}) {
  const filters = [
    { value: "NEW", label: "Mới" },
    { value: "REVIEWED", label: "Đã xem" },
    { value: "SHORTLISTED", label: "Chọn lọc" },
    { value: "IMPORTED", label: "Đã import" },
    { value: "ALL", label: "Tất cả" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={`/jobs?tab=applications&applicationStatus=${filter.value}`}
          className={
            status === filter.value
              ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
              : "rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted transition hover:border-primary/30 hover:text-foreground"
          }
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

function ApplicationPagination({
  page,
  totalPages,
  status,
}: {
  page: number;
  totalPages: number;
  status: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((nextPage) => (
        <Link
          key={nextPage}
          href={`/jobs?tab=applications&applicationStatus=${status}&applicationPage=${nextPage}`}
          className={
            nextPage === page
              ? "flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white"
              : "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-sm font-semibold text-muted transition hover:border-primary/30"
          }
        >
          {nextPage}
        </Link>
      ))}
    </div>
  );
}

export default async function JobsPage({ searchParams }: PageProps) {
  const scope = await requireViewerScope();
  const sp = await searchParams;
  const activeTab = normalizeTab(sp.tab, scope.isAdmin);

  if (!scope.isAdmin && sp.tab && sp.tab !== "orders") {
    redirect("/jobs?tab=orders");
  }

  const pageTitle =
    activeTab === "orders"
      ? "Yêu cầu tuyển dụng"
      : activeTab === "posts"
        ? "Bài đăng FDIWork"
        : "Ứng viên FDIWork";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <ListChecks className="h-4 w-4" />
            Module tuyển dụng
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{pageTitle}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Quản lý JobOrder CRM, bài đăng public trên FDIWork và ứng viên gửi từ
            FDIWork trong cùng một luồng vận hành.
          </p>
        </div>

        {activeTab !== "applications" ? (
          <Link
            href={activeTab === "posts" ? "/moderation/new" : "/jobs/new"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "posts" ? "Thêm bài đăng" : "Tạo JobOrder"}
          </Link>
        ) : null}
      </div>

      <RecruitmentTabs activeTab={activeTab} isAdmin={scope.isAdmin} />

      {activeTab === "orders" ? (
        <OrdersTab searchParams={sp} scope={scope} />
      ) : activeTab === "posts" ? (
        <PostsTab searchParams={sp} />
      ) : (
        <ApplicationsTab searchParams={sp} />
      )}
    </div>
  );
}

async function OrdersTab({
  searchParams,
  scope,
}: {
  searchParams: Awaited<PageProps["searchParams"]>;
  scope: Awaited<ReturnType<typeof requireViewerScope>>;
}) {
  const page = parsePage(searchParams.page);
  const result = await getJobs(
    {
      search: searchParams.search,
      status: searchParams.status as JobStatus | undefined,
      stage: searchParams.stage as JobCandidateStage | undefined,
      page,
      pageSize: 20,
    },
    scope
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">JobOrder CRM</h2>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0
              ? `Đang có ${result.total} yêu cầu tuyển dụng trong bộ lọc.`
              : "Chưa có JobOrder nào trong bộ lọc."}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          FDIWork status hiển thị trực tiếp trên từng JobOrder
        </span>
      </div>

      <Suspense>
        <JobFiltersPanel />
      </Suspense>

      <JobTable jobs={result.jobs} />

      <Suspense>
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
        />
      </Suspense>
    </div>
  );
}

async function PostsTab({
  searchParams,
}: {
  searchParams: Awaited<PageProps["searchParams"]>;
}) {
  const postStatus = searchParams.postStatus || "ALL";
  const postPage = parsePage(searchParams.postPage);
  const postPageSize = normalizePostPageSize(searchParams.postPageSize);
  const postSearch = searchParams.postSearch?.trim() ?? "";
  const postLink = normalizePostLink(searchParams.postLink);
  const data = await getPendingJobPostings({
    status: postStatus,
    page: postPage,
    pageSize: postPageSize,
    search: postSearch,
    linkState: postLink,
  });
  const jobOrderOptions = await getAdminJobOrderLinkOptions();

  return (
    <JobPostingModerationPanel
      data={data}
      status={postStatus}
      search={postSearch}
      linkState={postLink}
      jobOrderOptions={jobOrderOptions}
    />
  );
}

async function ApplicationsTab({
  searchParams,
}: {
  searchParams: Awaited<PageProps["searchParams"]>;
}) {
  const applicationStatus = searchParams.applicationStatus || "NEW";
  const applicationPage = parsePage(searchParams.applicationPage);
  const data = await getApplicationsForImport(applicationStatus, applicationPage);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileDown className="h-5 w-5 text-primary" />
          Inbox ứng viên từ FDIWork
        </h2>
        <p className="mt-1 text-sm text-muted">
          {data.total} đơn ứng tuyển từ FDIWork. Import vào Talent Pool hoặc link
          vào JobOrder để quản lý trong CRM.
        </p>
      </div>

      <ApplicationStatusFilters status={applicationStatus} />

      {data.applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <FileDown className="mx-auto mb-4 h-12 w-12 text-muted/30" />
          <p className="font-semibold text-foreground">Không có đơn ứng tuyển phù hợp</p>
          <p className="mt-1 text-sm text-muted">Thử đổi trạng thái để kiểm tra inbox khác.</p>
        </div>
      ) : (
        <ApplicationTable applications={JSON.parse(JSON.stringify(data.applications))} />
      )}

      <ApplicationPagination
        page={data.page}
        totalPages={data.totalPages}
        status={applicationStatus}
      />
    </div>
  );
}
