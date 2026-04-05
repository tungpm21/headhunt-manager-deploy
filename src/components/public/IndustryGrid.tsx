import Link from "next/link";
import {
  Cpu,
  Factory,
  CircuitBoard,
  Wrench,
  FlaskConical,
  Truck,
  BriefcaseBusiness,
  HardHat,
  ArrowRight,
} from "lucide-react";
import type { IndustryCount } from "@/lib/public-actions";

const industryIcons: Record<string, React.ElementType> = {
  "IT / Phần mềm": Cpu,
  "Sản xuất": Factory,
  "Điện tử": CircuitBoard,
  "Cơ khí": Wrench,
  "Hóa chất": FlaskConical,
  "Logistics": Truck,
  "Quản lý": BriefcaseBusiness,
  "Xây dựng": HardHat,
};

type IndustryGridProps = {
  industries: IndustryCount[];
};

export function IndustryGrid({ industries }: IndustryGridProps) {
  if (industries.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--color-fdi-text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Ngành nghề nổi bật
          </h2>
          <p
            className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Khám phá cơ hội việc làm theo lĩnh vực
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] rounded-2xl bg-white p-4">
          {industries.map((item) => {
            const Icon = industryIcons[item.industry] || BriefcaseBusiness;
            return (
              <Link
                key={item.industry}
                href={`/viec-lam?industry=${encodeURIComponent(item.industry)}`}
                className="group block cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-transparent bg-white hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="h-20 w-20 rounded-full bg-[#F2F8FF] flex items-center justify-center shrink-0 group-hover:bg-[#E8F3FF] group-hover:scale-105 transition-transform">
                    <Icon className="h-10 w-10 text-[#005A9E]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--color-fdi-text)] group-hover:text-[var(--color-fdi-accent-orange)] transition-colors uppercase leading-snug h-10 flex items-center justify-center">
                      {item.industry}
                    </p>
                    <p className="text-sm text-gray-500 font-medium whitespace-nowrap mt-2">
                      {item.count} Việc Làm
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:underline cursor-pointer"
          >
            Khám phá thêm →
          </Link>
        </div>
      </div>
    </section>
  );
}
