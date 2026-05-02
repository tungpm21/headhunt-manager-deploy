"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

function getThemeSnapshot() {
    if (typeof window === "undefined") return false;

    const stored = window.localStorage.getItem("theme");
    return stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function subscribeTheme(onStoreChange: () => void) {
    if (typeof window === "undefined") return () => {};

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const notify = () => onStoreChange();
    const notifySystemChange = () => {
        if (!window.localStorage.getItem("theme")) onStoreChange();
    };

    window.addEventListener("storage", notify);
    window.addEventListener("fdiwork-theme-change", notify);
    media.addEventListener("change", notifySystemChange);

    return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("fdiwork-theme-change", notify);
        media.removeEventListener("change", notifySystemChange);
    };
}

export function ThemeToggle() {
    const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

    const toggle = () => {
        const next = !dark;
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
        window.dispatchEvent(new Event("fdiwork-theme-change"));
    };

    return (
        <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors"
            title={dark ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
            aria-label="Toggle dark mode"
        >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
