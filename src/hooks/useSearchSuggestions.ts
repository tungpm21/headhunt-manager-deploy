"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export type SuggestionEmployer = {
  id: number;
  companyName: string;
  logo: string | null;
  slug: string;
  industry: string | null;
};

export type SuggestionJob = {
  id: number;
  title: string;
  slug: string;
  salaryDisplay: string | null;
  location: string | null;
  employer: { companyName: string; logo: string | null };
};

export type SearchSuggestions = {
  employers: SuggestionEmployer[];
  jobs: SuggestionJob[];
  popularKeywords: string[];
};

export function useSearchSuggestions() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const url = q
        ? `/api/public/search-suggestions?q=${encodeURIComponent(q)}`
        : `/api/public/search-suggestions`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return;
      const data: SearchSuggestions = await res.json();
      setSuggestions(data);
      setActiveIndex(-1);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useDebouncedCallback((q: string) => {
    fetchSuggestions(q);
  }, 300);

  function handleQueryChange(value: string) {
    setQuery(value);
    setIsOpen(true);
    if (value.trim()) {
      debouncedFetch(value.trim());
    } else {
      debouncedFetch.cancel();
      fetchSuggestions("");
    }
  }

  function handleFocus() {
    setIsOpen(true);
    if (!suggestions) {
      fetchSuggestions(query.trim());
    }
  }

  // Click-outside to close
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Flat list of navigable items for keyboard
  function getFlatItems(): Array<{ type: "employer" | "job" | "keyword"; value: string }> {
    if (!suggestions) return [];
    const items: Array<{ type: "employer" | "job" | "keyword"; value: string }> = [];
    for (const e of suggestions.employers) items.push({ type: "employer", value: e.slug });
    for (const j of suggestions.jobs) items.push({ type: "job", value: j.slug });
    for (const k of suggestions.popularKeywords) items.push({ type: "keyword", value: k });
    return items;
  }

  function navigateTo(type: "employer" | "job" | "keyword", value: string) {
    setIsOpen(false);
    setQuery("");
    if (type === "employer") router.push(`/cong-ty/${value}`);
    else if (type === "job") router.push(`/viec-lam/${value}`);
    else router.push(`/viec-lam?q=${encodeURIComponent(value)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    const items = getFlatItems();
    const total = items.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < total) {
      e.preventDefault();
      const item = items[activeIndex];
      navigateTo(item.type, item.value);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return {
    query,
    setQuery: handleQueryChange,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    activeIndex,
    handleFocus,
    handleKeyDown,
    navigateTo,
    containerRef,
  };
}
