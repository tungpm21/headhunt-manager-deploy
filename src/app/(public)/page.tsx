import { getHomepageData } from "@/lib/public-actions";
import { HeroSection } from "@/components/public/HeroSection";
import { EmployerBannerCarousel } from "@/components/public/EmployerBannerCarousel";
import { TopEmployers } from "@/components/public/TopEmployers";
import { FeaturedJobs } from "@/components/public/FeaturedJobs";
import { IndustryGrid } from "@/components/public/IndustryGrid";
import { BlogSection } from "@/components/public/BlogSection";
import { HomepageSectionDots } from "@/components/public/HomepageSectionDots";

const homepageSections = [
  { id: "home-hero", label: "Spotlight" },
  { id: "home-employers", label: "Nhà tuyển dụng" },
  { id: "home-jobs", label: "Việc làm" },
  { id: "home-industries", label: "Ngành nghề" },
  { id: "home-market", label: "Tín hiệu thị trường" },
  { id: "home-insights", label: "Chia sẻ" },
];

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div id="main-content" className="-mt-20 w-full max-w-full overflow-x-hidden bg-[var(--color-fdi-mist)]">
      <HomepageSectionDots sections={homepageSections} />

      <section id="home-hero" className="relative scroll-mt-28 overflow-hidden bg-[linear-gradient(180deg,#062746_0%,#0A4167_52%,#DDECEF_100%)] pb-2 text-white sm:pb-3 lg:pb-4">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-20" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(180deg,rgba(243,247,248,0)_0%,rgba(243,247,248,0.72)_62%,#F3F7F8_100%)]" />
        <div className="relative">
          <HeroSection />
          <EmployerBannerCarousel employers={data.bannerEmployers} />
        </div>
      </section>

      <div id="home-employers" className="scroll-mt-28">
        <TopEmployers employers={data.topEmployers} />
      </div>
      <div id="home-jobs" className="scroll-mt-28">
        <FeaturedJobs jobs={data.featuredJobs} />
      </div>
      <div id="home-industries" className="scroll-mt-28">
        <IndustryGrid industries={data.industries} />
      </div>
      <section id="home-market" className="scroll-mt-28 bg-[linear-gradient(180deg,#F5F8FA_0%,#FFFFFB_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-[2rem] border border-[#D8E7EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FCFC_100%)] p-5 shadow-[0_28px_72px_-56px_rgba(7,26,47,0.42)] sm:p-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr] lg:p-7">
          <div className="lg:pr-6">
            <p className="inline-flex rounded-full border border-[#BFDCE4] bg-[#EAF7FA] px-3 py-1 text-xs font-bold uppercase text-[var(--color-fdi-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">Market signal</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--color-fdi-ink)] sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
              FDI hiring momentum
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-fdi-text-secondary)]">
              Tổng hợp nhanh quy mô cơ hội và số doanh nghiệp FDI đang tuyển dụng trên FDIWork.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{data.stats.totalJobs.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Việc đang mở</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Cập nhật từ các tin FDI đang active</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{data.stats.totalEmployers.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Doanh nghiệp FDI</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Có hồ sơ công ty và vai trò tuyển dụng</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">1</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Bước ứng tuyển</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Luồng tìm kiếm đến chi tiết việc làm gọn hơn</p>
          </div>
        </div>
      </section>
      <div id="home-insights" className="scroll-mt-28">
        <BlogSection />
      </div>
    </div>
  );
}
