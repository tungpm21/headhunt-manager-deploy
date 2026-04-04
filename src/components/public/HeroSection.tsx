"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, TrendingUp } from "lucide-react";

const trendingTags = [
  "Kỹ sư cơ khí",
  "IT / Phần mềm",
  "Kế toán",
  "Nhân sự",
  "Sản xuất",
  "QC / QA",
];

type HeroSectionProps = {
  totalJobs: number;
  totalEmployers: number;
};

export function HeroSection({ totalJobs, totalEmployers }: HeroSectionProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/viec-lam?${params.toString()}`);
  }

  function handleTagClick(tag: string) {
    router.push(`/viec-lam?q=${encodeURIComponent(tag)}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[var(--color-fdi-accent)] blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[var(--color-fdi-primary)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tìm việc làm
            <span className="text-[var(--color-fdi-accent)]"> chất lượng cao</span>
            <br className="hidden sm:block" />
            tại doanh nghiệp FDI
          </h1>
          <p
            className="mt-4 text-base sm:text-lg text-sky-100/80 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Kết nối hàng ngàn ứng viên với các doanh nghiệp đầu tư nước ngoài hàng đầu tại Việt Nam
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-2xl bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Vị trí, kỹ năng, công ty..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              style={{ fontFamily: "var(--font-body)" }}
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 sm:w-44">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Địa điểm"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              style={{ fontFamily: "var(--font-body)" }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[var(--color-fdi-primary)] text-white font-semibold text-sm hover:bg-[var(--color-fdi-primary-hover)] transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Trending Tags */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <TrendingUp className="h-4 w-4 text-sky-300/60" />
          <span className="text-xs text-sky-300/60 mr-1">Xu hướng:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-sky-100 hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalJobs.toLocaleString("vi-VN")}+
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Việc làm mới</p>
          </div>
          <div className="w-px h-10 bg-blue-700/30" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalEmployers.toLocaleString("vi-VN")}+
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Doanh nghiệp</p>
          </div>
          <div className="w-px h-10 bg-blue-700/30" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              100%
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Miễn phí</p>
          </div>
        </div>
      </div>
    </section>
  );
}
