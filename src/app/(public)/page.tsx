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
    <>
      <HeroSection
        totalJobs={data.stats.totalJobs}
        totalEmployers={data.stats.totalEmployers}
      />
      <EmployerBannerCarousel employers={data.bannerEmployers} />
      <TopEmployers employers={data.topEmployers} />
      <FeaturedJobs jobs={data.featuredJobs} />
      <IndustryGrid industries={data.industries} />
      <BlogSection />
    </>
  );
}
