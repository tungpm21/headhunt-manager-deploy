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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {industries.map((item) => {
            const Icon = industryIcons[item.industry] || BriefcaseBusiness;
            return (
              <Link
                key={item.industry}
                href={`/viec-lam?industry=${encodeURIComponent(item.industry)}`}
                className="group block cursor-pointer"
              >
                <div className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary)]/20">
                  <div className="h-12 w-12 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-fdi-primary)]/10 transition-colors">
                    <Icon className="h-6 w-6 text-[var(--color-fdi-primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-fdi-text)] group-hover:text-[var(--color-fdi-primary)] transition-colors">
                      {item.industry}
                    </p>
                    <p className="text-xs text-[var(--color-fdi-text-secondary)] mt-0.5">
                      {item.count} việc làm
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
