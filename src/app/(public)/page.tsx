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
    <main className="-mt-20 w-full max-w-full overflow-x-hidden bg-[var(--color-fdi-mist)]">
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
            <p className="inline-flex rounded-full border border-[#BFDCE4] bg-[#EAF7FA] px-3 py-1 text-[10px] font-bold uppercase text-[var(--color-fdi-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">Market signal</p>
            <h2 className="mt-3 text-2xl font-black text-[var(--color-fdi-ink)] sm:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
              FDI hiring momentum
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-fdi-text-secondary)]">
              T&#7893;ng h&#7907;p nhanh quy m&#244; c&#417; h&#7897;i v&#224; s&#7889; doanh nghi&#7879;p FDI &#273;ang tuy&#7875;n d&#7909;ng tr&#234;n FDIWork.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{data.stats.totalJobs.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Việc đang mở</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">C&#7853;p nh&#7853;t t&#7915; c&#225;c tin FDI &#273;ang active</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{data.stats.totalEmployers.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Doanh nghiệp FDI</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">C&#243; h&#7891; s&#417; c&#244;ng ty v&#224; vai tr&#242; tuy&#7875;n d&#7909;ng</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">1</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">B&#432;&#7899;c &#7913;ng tuy&#7875;n</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Lu&#7891;ng t&#236;m ki&#7871;m &#273;&#7871;n chi ti&#7871;t vi&#7879;c l&#224;m g&#7885;n h&#417;n</p>
          </div>
        </div>
      </section>
      <div id="home-insights" className="scroll-mt-28">
        <BlogSection />
      </div>
    </main>
  );
}
