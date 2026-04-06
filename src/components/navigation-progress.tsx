"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim progress bar at the top of the viewport.
 * Activates on every Next.js App-Router navigation.
 */
export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Route changed → reset
        setLoading(false);
        setProgress(0);
    }, [pathname, searchParams]);

    useEffect(() => {
        // Intercept all <a> clicks inside the app to detect navigations
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (
                !anchor ||
                anchor.target === "_blank" ||
                anchor.origin !== window.location.origin ||
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey
            )
                return;

            // Same page → skip
            const href = anchor.href;
            const url = new URL(href);
            if (
                url.pathname === pathname &&
                url.search === (searchParams?.toString() ? `?${searchParams}` : "")
            )
                return;

            setLoading(true);
            setProgress(20);
        };

        document.addEventListener("click", handleClick, { capture: true });
        return () =>
            document.removeEventListener("click", handleClick, { capture: true });
    }, [pathname, searchParams]);

    // Animate progress forward while loading
    useEffect(() => {
        if (!loading) return;

        const t1 = setTimeout(() => setProgress(45), 150);
        const t2 = setTimeout(() => setProgress(65), 500);
        const t3 = setTimeout(() => setProgress(80), 1200);
        const t4 = setTimeout(() => setProgress(90), 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
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
