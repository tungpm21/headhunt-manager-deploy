"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { LogoImage } from "@/components/public/LogoImage";

type SearchOverlayProps = {
    isVisible: boolean;
    onClose: () => void;
    initialQuery?: string;
};

export function SearchOverlay({ isVisible, onClose, initialQuery = "" }: SearchOverlayProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const search = useSearchSuggestions();

    // Focus input when overlay opens
    useEffect(() => {
        if (isVisible) {
            // Set initial query if provided
            if (initialQuery) {
                search.setQuery(initialQuery);
            }
            search.handleFocus();
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (isVisible) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isVisible, onClose]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (search.query.trim()) {
            router.push(`/viec-lam?q=${encodeURIComponent(search.query.trim())}`);
            onClose();
        }
    }

    if (!isVisible) return null;

    const suggestions = search.suggestions;
    const hasEmployers = (suggestions?.employers.length ?? 0) > 0;
    const hasJobs = (suggestions?.jobs.length ?? 0) > 0;
    const hasKeywords = (suggestions?.popularKeywords.length ?? 0) > 0;
    const hasResults = hasEmployers || hasJobs;
    const noResultsForQuery = search.query.trim().length > 0 && !hasResults && !search.isLoading;

    // Flat index calculation for keyboard nav
    const employerOffset = 0;
    const jobOffset = (suggestions?.employers.length ?? 0);
    const keywordOffset = jobOffset + (suggestions?.jobs.length ?? 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Overlay panel */}
            <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top-2 fade-in duration-200">
                {/* Search bar area */}
                <div className="bg-white border-b border-gray-200 shadow-xl">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
                        {/* Close button */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Tìm kiếm
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                aria-label="Đóng"
                            >
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Full-width search input */}
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search.query}
                                    onChange={(e) => search.setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            e.stopPropagation();
                                            onClose();
                                            return;
                                        }
                                        search.handleKeyDown(e);
                                    }}
                                    placeholder="Vị trí tuyển dụng, tên công ty..."
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 text-base text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus:border-[var(--color-fdi-primary)] transition-colors bg-gray-50/50"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                className="shrink-0 px-6 py-3.5 rounded-xl bg-[var(--color-fdi-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
                            >
                                <Search className="h-4 w-4" />
                                Tìm kiếm
                            </button>
                        </form>

                        {/* Results panel — 2-column layout like TopCV */}
                        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-gray-100 bg-white">
                            {/* Loading state */}
                            {search.isLoading && !suggestions && (
                                <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tìm kiếm...
                                </div>
                            )}

                            {/* 2-column grid */}
                            {(hasKeywords || hasResults || noResultsForQuery) && (
                                <div className="grid grid-cols-1 md:grid-cols-5">
                                    {/* Left column — Keywords */}
                                    <div className="md:col-span-2 md:border-r border-gray-100 p-4">
                                        {/* Search type filters */}
                                        {search.query.trim() === "" && (
                                            <div className="mb-4 pb-3 border-b border-gray-100">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Tìm kiếm theo
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="search-type" defaultChecked className="accent-[var(--color-fdi-primary)]" />
                                                        Tên việc làm
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="search-type" className="accent-[var(--color-fdi-primary)]" />
                                                        Tên công ty
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input type="radio" name="search-type" className="accent-[var(--color-fdi-primary)]" />
                                                        Cả hai
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Popular keywords */}
                                        {hasKeywords && (
                                            <div>
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Từ khóa phổ biến
                                                </p>
                                                <div className="space-y-0.5">
                                                    {suggestions!.popularKeywords.map((kw, i) => {
                                                        const idx = keywordOffset + i;
                                                        return (
                                                            <button
                                                                key={kw}
                                                                type="button"
                                                                onClick={() => {
                                                                    search.navigateTo("keyword", kw);
                                                                    onClose();
                                                                }}
                                                                onMouseEnter={() => search.setActiveIndex?.(idx)}
                                                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left cursor-pointer transition-colors ${search.activeIndex === idx
                                                                        ? "bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]"
                                                                        : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-fdi-primary)]"
                                                                    }`}
                                                            >
                                                                <Search className="h-3.5 w-3.5 shrink-0 opacity-40" />
                                                                {kw}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Employer matches — show here when user is typing */}
                                        {hasEmployers && (
                                            <div className={hasKeywords ? "mt-4 pt-3 border-t border-gray-100" : ""}>
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Có phải bạn đang tìm
                                                </p>
                                                <div className="space-y-0.5">
                                                    {suggestions!.employers.map((emp, i) => {
                                                        const idx = employerOffset + i;
                                                        return (
                                                            <button
                                                                key={emp.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    search.navigateTo("employer", emp.slug);
                                                                    onClose();
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${search.activeIndex === idx
                                                                        ? "bg-[var(--color-fdi-surface)]"
                                                                        : "hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                    <LogoImage
                                                                        src={emp.logo}
                                                                        alt={emp.companyName}
                                                                        className="h-full w-full object-contain p-0.5"
                                                                        iconSize="h-3.5 w-3.5"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 text-left min-w-0">
                                                                    <p className="text-sm font-medium text-[var(--color-fdi-text)] truncate">
                                                                        {emp.companyName}
                                                                    </p>
                                                                    {emp.industry && (
                                                                        <p className="text-xs text-gray-400 truncate">{emp.industry}</p>
                                                                    )}
                                                                </div>
                                                                <span className="shrink-0 text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                                    Công ty
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right column — Jobs */}
                                    <div className="md:col-span-3 p-4 border-t md:border-t-0 border-gray-100">
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            {search.query.trim()
                                                ? "Việc làm bạn sẽ thích"
                                                : "Việc làm có thể bạn quan tâm"}
                                        </p>

                                        {hasJobs ? (
                                            <div className="space-y-0.5">
                                                {suggestions!.jobs.map((job, i) => {
                                                    const idx = jobOffset + i;
                                                    return (
                                                        <button
                                                            key={job.id}
                                                            type="button"
                                                            onClick={() => {
                                                                search.navigateTo("job", job.slug);
                                                                onClose();
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors ${search.activeIndex === idx
                                                                    ? "bg-[var(--color-fdi-surface)]"
                                                                    : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                                <LogoImage
                                                                    src={job.employer.logo}
                                                                    alt={job.employer.companyName}
                                                                    className="h-full w-full object-contain p-1"
                                                                    iconSize="h-4 w-4"
                                                                />
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <p className="text-sm font-medium text-[var(--color-fdi-text)] truncate">
                                                                    {job.title}
                                                                </p>
                                                                <p className="text-xs text-gray-400 truncate">
                                                                    {job.employer.companyName}
                                                                </p>
                                                            </div>
                                                            {job.salaryDisplay && (
                                                                <span className="shrink-0 text-xs font-bold text-[var(--color-fdi-accent-orange)]">
                                                                    {job.salaryDisplay}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : noResultsForQuery ? (
                                            <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                                                <Search className="h-4 w-4" />
                                                Không tìm thấy kết quả cho &ldquo;{search.query}&rdquo;
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 py-3">
                                                Nhập từ khóa để tìm việc làm phù hợp
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
