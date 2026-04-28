"use client";

import { useEffect, useState } from "react";

type HomepageSection = {
  id: string;
  label: string;
};

type HomepageSectionDotsProps = {
  sections: HomepageSection[];
};

export function HomepageSectionDots({ sections }: HomepageSectionDotsProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 84;
    const rect = element.getBoundingClientRect();
    const availableHeight = window.innerHeight - headerOffset;
    const centerOffset =
      rect.height < availableHeight ? (availableHeight - rect.height) / 2 : 0;
    const top = window.scrollY + rect.top - headerOffset - centerOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (sections.length === 0) return;

    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-42% 0px -58% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Điều hướng các phần trang"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 rounded-full border border-[#D8E7EA]/80 bg-white/78 p-2 shadow-[0_22px_54px_-38px_rgba(7,26,47,0.56)] backdrop-blur-xl lg:flex"
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={section.label}
            aria-current={isActive ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setActiveId(section.id);
              scrollToSection(section.id);
            }}
            className="group relative flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
          >
            <span className="pointer-events-none absolute right-full mr-3 max-w-[180px] whitespace-nowrap rounded-full border border-[#D8E7EA] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-fdi-ink)] opacity-0 shadow-[0_16px_34px_-28px_rgba(7,26,47,0.55)] transition-[opacity,transform] duration-300 group-hover:-translate-x-1 group-hover:opacity-100 group-focus-visible:-translate-x-1 group-focus-visible:opacity-100">
              {section.label}
            </span>
            <span
              className={`rounded-full transition-[height,width,background-color,box-shadow] duration-300 ${
                isActive
                  ? "h-5 w-2 bg-[var(--color-fdi-primary)] shadow-[0_10px_20px_-12px_rgba(10,111,157,0.9)]"
                  : "h-2.5 w-2.5 bg-[#B8CCD3] group-hover:bg-[var(--color-fdi-primary)]"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
