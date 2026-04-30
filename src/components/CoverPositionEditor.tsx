"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Move, RotateCcw } from "lucide-react";

type CoverPositionEditorProps = {
    imageUrl: string;
    positionX: number; // 0-100
    positionY: number; // 0-100
    zoom: number; // 100-200
    aspectRatio?: string;
    onChange: (pos: { positionX: number; positionY: number; zoom: number }) => void;
};

export function CoverPositionEditor({
    imageUrl,
    positionX: initX,
    positionY: initY,
    zoom: initZoom,
    aspectRatio = "2 / 1",
    onChange,
}: CoverPositionEditorProps) {
    const [posX, setPosX] = useState(initX);
    const [posY, setPosY] = useState(initY);
    const [zoom, setZoom] = useState(initZoom);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; origPosX: number; origPosY: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const emitChange = useCallback(
        (x: number, y: number, z: number) => {
            onChange({ positionX: x, positionY: y, zoom: z });
        },
        [onChange]
    );

    // --- Mouse drag ---
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origPosX: posX,
                origPosY: posY,
            };
        },
        [posX, posY]
    );

    useEffect(() => {
        if (!isDragging) return;

        function onMove(e: MouseEvent) {
            if (!dragRef.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const dx = ((e.clientX - dragRef.current.startX) / rect.width) * -100;
            const dy = ((e.clientY - dragRef.current.startY) / rect.height) * -100;
            const newX = Math.min(100, Math.max(0, dragRef.current.origPosX + dx));
            const newY = Math.min(100, Math.max(0, dragRef.current.origPosY + dy));
            const roundedX = Math.round(newX);
            const roundedY = Math.round(newY);
            setPosX(roundedX);
            setPosY(roundedY);
            emitChange(roundedX, roundedY, zoom);
        }

        function onUp() {
            setIsDragging(false);
            if (dragRef.current) {
                emitChange(
                    Math.round(posX),
                    Math.round(posY),
                    zoom
                );
            }
            dragRef.current = null;
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isDragging, posX, posY, zoom, emitChange]);

    // --- Touch drag ---
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            const touch = e.touches[0];
            setIsDragging(true);
            dragRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                origPosX: posX,
                origPosY: posY,
            };
        },
        [posX, posY]
    );

    useEffect(() => {
        if (!isDragging) return;

        function onTouchMove(e: TouchEvent) {
            if (!dragRef.current || !containerRef.current) return;
            const touch = e.touches[0];
            const rect = containerRef.current.getBoundingClientRect();
            const dx = ((touch.clientX - dragRef.current.startX) / rect.width) * -100;
            const dy = ((touch.clientY - dragRef.current.startY) / rect.height) * -100;
            const newX = Math.min(100, Math.max(0, dragRef.current.origPosX + dx));
            const newY = Math.min(100, Math.max(0, dragRef.current.origPosY + dy));
            const roundedX = Math.round(newX);
            const roundedY = Math.round(newY);
            setPosX(roundedX);
            setPosY(roundedY);
            emitChange(roundedX, roundedY, zoom);
        }

        function onTouchEnd() {
            setIsDragging(false);
            emitChange(Math.round(posX), Math.round(posY), zoom);
            dragRef.current = null;
        }

        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);
        return () => {
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, [isDragging, posX, posY, zoom, emitChange]);

    const handleZoomChange = (newZoom: number) => {
        const clamped = Math.min(200, Math.max(100, newZoom));
        setZoom(clamped);
        emitChange(posX, posY, clamped);
    };

    const handleReset = () => {
        setPosX(50);
        setPosY(50);
        setZoom(100);
        emitChange(50, 50, 100);
    };

    return (
        <div className="space-y-3">
            {/* Preview area */}
            <div
                ref={containerRef}
                className={`relative w-full min-h-40 rounded-xl border-2 border-dashed overflow-hidden select-none ${isDragging ? "border-primary cursor-grabbing" : "border-border cursor-grab"
                    }`}
                style={{ aspectRatio }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <img
                    src={imageUrl}
                    alt="Cover preview"
                    className="w-full h-full pointer-events-none"
                    draggable={false}
                    style={{
                        objectFit: "cover",
                        objectPosition: `${posX}% ${posY}%`,
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: `${posX}% ${posY}%`,
                    }}
                />

                {/* Drag hint overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs font-medium transition-opacity ${isDragging ? "opacity-0" : "opacity-70"}`}>
                        <Move className="h-3 w-3" />
                        Kéo để điều chỉnh vị trí
                    </div>
                </div>
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-3">
                {/* Zoom controls */}
                <div className="flex items-center gap-2 flex-1">
                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom - 10)}
                        disabled={zoom <= 100}
                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Thu nhỏ"
                    >
                        <ZoomOut className="h-3.5 w-3.5" />
                    </button>

                    <input
                        type="range"
                        min={100}
                        max={200}
                        step={5}
                        value={zoom}
                        onChange={(e) => handleZoomChange(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-primary cursor-pointer"
                    />

                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom + 10)}
                        disabled={zoom >= 200}
                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-surface transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Phóng to"
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                    </button>

                    <span className="text-xs text-muted w-10 text-right">{zoom}%</span>
                </div>

                {/* Reset */}
                <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition cursor-pointer"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </button>
            </div>
        </div>
    );
}
