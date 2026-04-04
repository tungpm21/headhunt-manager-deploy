import { getHomepageData } from "@/lib/public-actions";
import { HeroSection } from "@/components/public/HeroSection";
import { FeaturedJobs } from "@/components/public/FeaturedJobs";
import { EmployerCarousel } from "@/components/public/EmployerCarousel";
import { IndustryGrid } from "@/components/public/IndustryGrid";

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <HeroSection
        totalJobs={data.stats.totalJobs}
        totalEmployers={data.stats.totalEmployers}
      />
      <FeaturedJobs jobs={data.featuredJobs} />
      <EmployerCarousel employers={data.topEmployers} />
      <IndustryGrid industries={data.industries} />
    </>
  );
}
