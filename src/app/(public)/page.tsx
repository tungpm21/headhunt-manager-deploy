import { getHomepageData } from "@/lib/public-actions";
import { HeroSection } from "@/components/public/HeroSection";
import { FeaturedJobs } from "@/components/public/FeaturedJobs";
import { TopEmployers } from "@/components/public/TopEmployers";
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
      <TopEmployers employers={data.topEmployers} />
      <IndustryGrid industries={data.industries} />
    </>
  );
}
