"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2 } from "lucide-react";

type LogoImageProps = {
    src: string | null;
    alt: string;
    size?: number;
    className?: string;
    iconSize?: string;
    sizes?: string;
};

export function LogoImage({ src, alt, size = 160, className = "h-full w-full object-contain p-1", iconSize = "h-6 w-6", sizes = "96px" }: LogoImageProps) {
    const [errored, setErrored] = useState(false);

    if (!src || errored) {
        const iconCls = iconSize.includes("text-") ? iconSize : `${iconSize} text-[var(--color-fdi-primary)]`;
        return <Building2 className={iconCls} />;
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            sizes={sizes}
            className={className}
            unoptimized={src.toLowerCase().endsWith(".svg")}
            onError={() => setErrored(true)}
        />
    );
}
