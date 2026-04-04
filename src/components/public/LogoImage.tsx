"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

type LogoImageProps = {
    src: string | null;
    alt: string;
    className?: string;
    iconSize?: string;
};

export function LogoImage({ src, alt, className = "h-full w-full object-contain p-1", iconSize = "h-6 w-6" }: LogoImageProps) {
    const [errored, setErrored] = useState(false);

    if (!src || errored) {
        const iconCls = iconSize.includes("text-") ? iconSize : `${iconSize} text-[var(--color-fdi-primary)]`;
        return <Building2 className={iconCls} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setErrored(true)}
        />
    );
}
