"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PointerEvent } from "react";

const CLICK_SUPPRESSION_MS = 300;
const ACTIVATION_DISTANCE = 8;
const REBOUND_MS = 260;
const COMMIT_MS = 320;
const TRACK_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type SlideDirection = "previous" | "next";
type TrackPhase = "idle" | "dragging" | "animating" | "rebounding";

type ElasticPageDragOptions = {
  enabled: boolean;
  threshold?: number;
  pageGap?: number;
  interactiveSelector?: string;
  onNext: () => void;
  onPrevious: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useElasticPageDrag({
  enabled,
  threshold = 48,
  pageGap = 0,
  interactiveSelector = "button,input,textarea,select,[data-no-drag]",
  onNext,
  onPrevious,
  onDragStart,
  onDragEnd,
}: ElasticPageDragOptions) {
  const pageGapPx = Math.max(0, pageGap);
  const baseTransform = pageGapPx > 0 ? `translate3d(calc(-100% - ${pageGapPx}px), 0, 0)` : "translate3d(-100%, 0, 0)";
  const nextTransform = pageGapPx > 0 ? `translate3d(calc(-200% - ${pageGapPx * 2}px), 0, 0)` : "translate3d(-200%, 0, 0)";
  const [phase, setPhase] = useState<TrackPhase>("idle");
  const [dragOffset, setDragOffset] = useState(0);
  const [targetTransform, setTargetTransform] = useState(baseTransform);
  const dragStartX = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);
  const moved = useRef(false);
  const ignoreClickUntil = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const phaseRef = useRef<TrackPhase>("idle");

  const setTrackPhase = useCallback((nextPhase: TrackPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearPendingTransition = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const finishInteraction = useCallback(
    (delay: number) => {
      clearPendingTransition();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (!mountedRef.current) return;
        setDragOffset(0);
        setTargetTransform(baseTransform);
        setTrackPhase("idle");
        onDragEnd?.();
      }, prefersReducedMotion() ? 0 : delay);
    },
    [baseTransform, clearPendingTransition, onDragEnd, setTrackPhase],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearPendingTransition();
    };
  }, [clearPendingTransition]);

  const shouldIgnoreClick = useCallback(() => Date.now() < ignoreClickUntil.current, []);

  const resetWithoutCommit = useCallback(() => {
    setTrackPhase("rebounding");
    setDragOffset(0);
    setTargetTransform(baseTransform);
    finishInteraction(REBOUND_MS);
  }, [baseTransform, finishInteraction, setTrackPhase]);

  const completeCommit = useCallback(
    (direction: SlideDirection) => {
      if (direction === "next") {
        onNext();
      } else {
        onPrevious();
      }
      finishInteraction(0);
    },
    [finishInteraction, onNext, onPrevious],
  );

  const slideTo = useCallback(
    (direction: SlideDirection) => {
      if (!enabled || phaseRef.current !== "idle") return;

      clearPendingTransition();
      setTrackPhase("animating");
      setDragOffset(0);
      setTargetTransform(direction === "next" ? nextTransform : "translate3d(0%, 0, 0)");
      onDragStart?.();

      if (prefersReducedMotion()) {
        completeCommit(direction);
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (!mountedRef.current) return;
        completeCommit(direction);
      }, COMMIT_MS);
    },
    [clearPendingTransition, completeCommit, enabled, nextTransform, onDragStart, setTrackPhase],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0 || phaseRef.current !== "idle") return;

      const target = event.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) return;

      clearPendingTransition();
      dragStartX.current = event.clientX;
      pointerId.current = event.pointerId;
      moved.current = false;
      setDragOffset(0);
      setTargetTransform(baseTransform);
    },
    [baseTransform, clearPendingTransition, enabled, interactiveSelector],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (dragStartX.current === null || pointerId.current !== event.pointerId) return;

      const deltaX = event.clientX - dragStartX.current;
      if (Math.abs(deltaX) > ACTIVATION_DISTANCE) {
        if (!moved.current) {
          moved.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setTrackPhase("dragging");
          onDragStart?.();
        }

        ignoreClickUntil.current = Date.now() + CLICK_SUPPRESSION_MS;
        event.preventDefault();
        setDragOffset(deltaX);
      }
    },
    [onDragStart, setTrackPhase],
  );

  const finishPointerDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (dragStartX.current === null || pointerId.current !== event.pointerId) return;

      const deltaX = event.clientX - dragStartX.current;
      dragStartX.current = null;
      pointerId.current = null;

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }

      if (moved.current) {
        ignoreClickUntil.current = Date.now() + CLICK_SUPPRESSION_MS;
      } else {
        return;
      }

      if (Math.abs(deltaX) < threshold) {
        resetWithoutCommit();
        return;
      }

      const direction: SlideDirection = deltaX < 0 ? "next" : "previous";
      setTrackPhase("animating");
      setDragOffset(0);
      setTargetTransform(direction === "next" ? nextTransform : "translate3d(0%, 0, 0)");

      if (prefersReducedMotion()) {
        completeCommit(direction);
        return;
      }

      clearPendingTransition();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        if (!mountedRef.current) return;
        completeCommit(direction);
      }, COMMIT_MS);
    },
    [clearPendingTransition, completeCommit, nextTransform, resetWithoutCommit, setTrackPhase, threshold],
  );

  const cancelPointerDrag = useCallback(() => {
    if (dragStartX.current === null) return;
    const didMove = moved.current;
    dragStartX.current = null;
    pointerId.current = null;
    if (!didMove) return;
    resetWithoutCommit();
  }, [resetWithoutCommit]);

  const trackStyle: CSSProperties = useMemo(
    () => ({
      transform: phase === "dragging" ? `translate3d(calc(-100% - ${pageGapPx}px + ${dragOffset}px), 0, 0)` : targetTransform,
      transition:
        phase === "animating"
          ? `transform ${COMMIT_MS}ms ${TRACK_EASE}`
          : phase === "rebounding"
            ? `transform ${REBOUND_MS}ms ${TRACK_EASE}`
            : undefined,
      willChange: phase === "idle" ? undefined : "transform",
    }),
    [dragOffset, pageGapPx, phase, targetTransform],
  );

  const dragHandlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointerDrag,
      onPointerCancel: cancelPointerDrag,
    }),
    [cancelPointerDrag, finishPointerDrag, onPointerDown, onPointerMove],
  );

  return {
    dragHandlers,
    trackStyle,
    isActive: phase !== "idle",
    isDragging: phase === "dragging",
    shouldIgnoreClick,
    slideTo,
  };
}
