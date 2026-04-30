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
  { id: "home-insights", label: "Chia sẻ" },
];

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div id="main-content" className="w-full max-w-full overflow-x-hidden bg-[var(--color-fdi-mist)]">
      <HomepageSectionDots sections={homepageSections} />

      <section id="home-hero" className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFB_48%,#EEF6F8_100%)] pb-4 text-[var(--color-fdi-text)] sm:pb-5 lg:pb-6">
        <div className="absolute inset-0 opacity-[0.42] [background-image:radial-gradient(circle_at_88%_18%,rgba(10,111,157,0.10)_0,rgba(10,111,157,0.10)_1px,transparent_1.5px),radial-gradient(circle_at_12%_20%,rgba(10,111,157,0.08)_0,rgba(10,111,157,0.08)_1px,transparent_1.5px)] [background-size:22px_22px,26px_26px]" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full border border-[#D8E7EA]/65 opacity-55" />
        <div className="pointer-events-none absolute -left-44 top-10 h-[34rem] w-[34rem] rounded-full border border-[#D8E7EA]/45 opacity-50" />
        <div className="pointer-events-none absolute -right-40 top-44 h-[32rem] w-[32rem] rounded-full border border-[#D8E7EA]/45 opacity-45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(243,247,248,0)_0%,#F3F7F8_100%)]" />
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
        <IndustryGrid industries={data.industries} stats={data.stats} />
      </div>
      <div id="home-insights" className="scroll-mt-28">
        <BlogSection />
      </div>
    </div>
  );
}
