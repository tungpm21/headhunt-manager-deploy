import { getHomepageData } from "@/lib/public-actions";
import { HeroSection } from "@/components/public/HeroSection";
import { EmployerBannerCarousel } from "@/components/public/EmployerBannerCarousel";
import { TopEmployers } from "@/components/public/TopEmployers";
import { FeaturedJobs } from "@/components/public/FeaturedJobs";
import { IndustryGrid } from "@/components/public/IndustryGrid";
import { BlogSection } from "@/components/public/BlogSection";

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <main className="-mt-2 w-full max-w-full overflow-x-hidden bg-[#F6F8FA]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#052A4D_0%,#073C68_42%,#062F58_76%,#F6F8FA_100%)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-25" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,rgba(246,248,250,0)_0%,#F6F8FA_88%)]" />
        <div className="relative">
          <HeroSection
            totalJobs={data.stats.totalJobs}
            totalEmployers={data.stats.totalEmployers}
          />
          <EmployerBannerCarousel employers={data.bannerEmployers} />
          <TopEmployers employers={data.topEmployers} />
        </div>
      </section>

      <FeaturedJobs jobs={data.featuredJobs} />
      <IndustryGrid industries={data.industries} />
      <BlogSection />
    </main>
  );
}
