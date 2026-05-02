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

      <section
        id="home-hero"
        className="relative scroll-mt-24 overflow-hidden bg-[#F3F7F8] pb-5 text-[var(--color-fdi-text)] sm:pb-6 lg:pb-8"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(248,251,252,0.94) 0%, rgba(238,245,248,0.88) 48%, rgba(243,247,248,1) 100%), url('/background-pattern/homepage-network.webp')",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(243,247,248,0)_0%,#F3F7F8_100%)]" />
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
