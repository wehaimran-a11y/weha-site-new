import { useEffect, useRef, useState, useCallback } from "react";

/**
 * ScrollPill — a compact scrollbar pinned to the right edge of the viewport.
 * A short (~2in) track holds a "thumb" that reflects the page scroll position.
 * It is fully interactive: users can click anywhere on the track to jump, or
 * press and drag the thumb to scroll the page. Integrates with Lenis smooth
 * scroll when present.
 */
const TRACK = 192; // ~2 inches
const THUMB = 52;
const TRAVEL = TRACK - THUMB;

export default function ScrollPill() {
  const [reduce, setReduce] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const maxScroll = useCallback(
    () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    []
  );

  // Keep the thumb synced to the real scroll position (except while dragging).
  useEffect(() => {
    if (reduce) return undefined;
    const onScroll = () => {
      if (draggingRef.current) return;
      setProgress(window.scrollY / maxScroll());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce, maxScroll]);

  const scrollToProgress = useCallback(
    (p) => {
      const clamped = Math.min(1, Math.max(0, p));
      setProgress(clamped);
      const target = clamped * maxScroll();
      if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true });
      else window.scrollTo({ top: target });
    },
    [maxScroll]
  );

  const progressFromClientY = useCallback((clientY) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    // Center the thumb on the pointer for a natural grab feel.
    const y = clientY - rect.top - THUMB / 2;
    return y / TRAVEL;
  }, []);

  const onPointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    scrollToProgress(progressFromClientY(e.clientY));
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    scrollToProgress(progressFromClientY(e.clientY));
  };

  const endDrag = (e) => {
    draggingRef.current = false;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  if (reduce) return null;

  const y = progress * TRAVEL;

  return (
    <div
      ref={trackRef}
      data-testid="scroll-pill"
      role="scrollbar"
      aria-orientation="vertical"
      aria-label="Page scroll"
      aria-controls="root"
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      data-cursor="hover"
      className="hidden md:block fixed right-2 top-1/2 -translate-y-1/2 z-[55] cursor-pointer select-none touch-none"
      style={{ height: TRACK, width: 14 }}
    >
      {/* track */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{ width: 6, background: "color-mix(in srgb, var(--weha-text) 12%, transparent)" }}
      />
      {/* thumb */}
      <div
        data-testid="scroll-pill-thumb"
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          height: THUMB,
          width: dragging ? 8 : 6,
          top: y,
          background: "var(--weha-pop)",
          transition: dragging ? "none" : "width 0.12s ease",
        }}
      />
    </div>
  );
}
