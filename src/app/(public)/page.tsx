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

      <section id="home-hero" className="relative scroll-mt-24 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(14,116,190,0.11),transparent_36%),linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_42%,#F3F8FC_100%)] pb-5 text-[var(--color-fdi-text)] sm:pb-6 lg:pb-8">
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 opacity-45 [background-image:radial-gradient(rgba(14,116,190,0.18)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_0%_0%,black_0%,transparent_72%)]" />
        <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 opacity-35 [background-image:radial-gradient(rgba(14,116,190,0.16)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:radial-gradient(circle_at_100%_18%,black_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-[26rem] w-[56rem] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle,rgba(14,116,190,0.10)_0%,rgba(14,116,190,0.045)_38%,transparent_72%)] blur-2xl" />
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
