import { getHomepageData } from "@/lib/public-actions";
import Link from "next/link";
import { HeroSection } from "@/components/public/HeroSection";
import { EmployerBannerCarousel } from "@/components/public/EmployerBannerCarousel";
import { TopEmployers } from "@/components/public/TopEmployers";
import { FeaturedJobs } from "@/components/public/FeaturedJobs";
import { IndustryGrid } from "@/components/public/IndustryGrid";
import { BlogSection } from "@/components/public/BlogSection";
import { HomepageSectionDots } from "@/components/public/HomepageSectionDots";
import { LogoImage } from "@/components/public/LogoImage";

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
        className="relative scroll-mt-24 overflow-hidden bg-[#F7FBFF] pb-5 text-[var(--color-fdi-text)] sm:pb-6 lg:pb-8"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(247,251,255,0.56) 0%, rgba(255,255,255,0.48) 42%, rgba(243,248,252,0.92) 100%), url('/background-pattern/homepage-network.png')",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="pointer-events-none absolute left-1/2 top-28 h-[30rem] w-[72rem] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle,rgba(14,116,190,0.16)_0%,rgba(14,116,190,0.055)_38%,transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(243,247,248,0)_0%,#F3F7F8_100%)]" />
        <div className="relative">
          <HeroSection />
          <EmployerBannerCarousel employers={data.bannerEmployers} />
          {data.topEmployers.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-4 px-4 pb-2 sm:px-6 lg:flex-row lg:items-center lg:px-8">
              <div className="shrink-0 text-base font-black leading-tight text-[var(--color-fdi-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
                Doanh nghiệp hàng đầu
                <span className="block text-[var(--color-fdi-primary)]">tin tưởng FDIWork</span>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {data.topEmployers.slice(0, 8).map((employer) => (
                  <Link
                    key={employer.id}
                    href={`/cong-ty/${employer.slug}`}
                    className="flex h-14 items-center justify-center rounded-lg border border-[#D8E7EA] bg-white/86 px-3 shadow-[0_16px_32px_-28px_rgba(7,26,47,0.55)] backdrop-blur transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary)]/35 hover:shadow-[0_18px_38px_-26px_rgba(7,26,47,0.62)]"
                    aria-label={`Xem công ty ${employer.companyName}`}
                  >
                    <LogoImage
                      src={employer.logo}
                      alt={employer.companyName}
                      className="h-full max-h-9 w-full object-contain"
                      iconSize="h-6 w-6"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
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
