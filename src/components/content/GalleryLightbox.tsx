"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ContentImage } from "@/lib/content-blocks";

export function GalleryLightbox({ images }: { images: ContentImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const currentIndex = activeIndex ?? 0;

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === null ? current : (current - 1 + images.length) % images.length));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? current : (current + 1) % images.length));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <figure key={`${image.url}-${index}`} className="overflow-hidden rounded-xl bg-[#F2F7FA]">
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D94B16] focus-visible:ring-offset-2"
              aria-label={`Xem ảnh: ${image.alt}`}
            >
              <span className="block aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                />
              </span>
              {image.caption ? (
                <figcaption className="px-3 py-2 text-xs font-medium text-[#526173]">{image.caption}</figcaption>
              ) : null}
            </button>
          </figure>
        ))}
      </div>

      {activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071522]/88 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col gap-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#102033] transition hover:bg-white"
                aria-label="Đóng preview ảnh"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-[#0E1A27]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={activeImage.alt}
                className="max-h-[78vh] w-full object-contain"
              />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((currentIndex - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#102033] transition hover:bg-white"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((currentIndex + 1) % images.length)}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#102033] transition hover:bg-white"
                    aria-label="Ảnh tiếp theo"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
            {activeImage.caption ? (
              <p className="rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-[#102033]">{activeImage.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
