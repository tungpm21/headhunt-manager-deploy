"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  return <NavigationProgressInner key={routeKey} routeKey={routeKey} />;
}

function NavigationProgressInner({ routeKey }: { routeKey: string }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.origin !== window.location.origin ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      const targetUrl = new URL(anchor.href);
      const targetKey = `${targetUrl.pathname}?${targetUrl.searchParams.toString()}`;
      if (targetKey === routeKey) {
        return;
      }

      setLoading(true);
      setProgress(20);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [routeKey]);

  useEffect(() => {
    if (!loading) return;

    const timers = [
      window.setTimeout(() => setProgress(45), 150),
      window.setTimeout(() => setProgress(65), 500),
      window.setTimeout(() => setProgress(80), 1200),
      window.setTimeout(() => setProgress(90), 3000),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
