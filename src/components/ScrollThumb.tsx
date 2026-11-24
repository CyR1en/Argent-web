"use client";

import React, { useEffect, useRef } from "react";
import { onScrollFrame, scrollToY } from "@/lib/scroll";

const MIN_THUMB = 44;
const IDLE_MS = 1100;

/**
 * The page's scrollbar for a mouse or trackpad: an overlay thumb on the right edge that shows
 * while the page moves, drags like the native one, and jumps on a click in its track. It stands in
 * for the native bar that globals.css hides, so the backdrop can run to the window's edge.
 */
export function ScrollThumb() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    let thumbHeight = MIN_THUMB;
    let travel = 0;
    let scrollable = 0;
    let idleTimer = 0;
    let drag: { pointerY: number; scrollY: number } | null = null;

    const wake = () => {
      track.dataset.awake = "true";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!drag) delete track.dataset.awake;
      }, IDLE_MS);
    };

    let firstFrame = true;
    const stop = onScrollFrame(() => {
      const viewport = window.innerHeight;
      scrollable = document.documentElement.scrollHeight - viewport;
      thumbHeight = Math.max(MIN_THUMB, (viewport * viewport) / (scrollable + viewport));
      travel = viewport - thumbHeight;
      const offset = scrollable > 0 ? (window.scrollY / scrollable) * travel : 0;
      return () => {
        track.hidden = scrollable <= 0;
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${offset.toFixed(1)}px)`;
        if (!firstFrame) wake();
        firstFrame = false;
      };
    });

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || travel <= 0) return;
      event.preventDefault();
      let scrollY = window.scrollY;
      const thumbTop = (scrollY / scrollable) * travel;
      if (event.clientY < thumbTop || event.clientY > thumbTop + thumbHeight) {
        // A press in the track brings the thumb's middle to the pointer.
        const offset = Math.min(travel, Math.max(0, event.clientY - thumbHeight / 2));
        scrollY = (offset / travel) * scrollable;
        scrollToY(scrollY, true);
      }
      drag = { pointerY: event.clientY, scrollY };
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = "true";
      wake();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag) return;
      const delta = ((event.clientY - drag.pointerY) / travel) * scrollable;
      scrollToY(Math.min(scrollable, Math.max(0, drag.scrollY + delta)), true);
    };
    const endDrag = () => {
      drag = null;
      delete track.dataset.dragging;
      wake();
    };

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerenter", wake);

    return () => {
      stop();
      window.clearTimeout(idleTimer);
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", endDrag);
      track.removeEventListener("pointercancel", endDrag);
      track.removeEventListener("pointerenter", wake);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="group fixed inset-y-0 right-0 z-50 hidden w-3.5 touch-none [@media(hover:hover)_and_(pointer:fine)]:block"
    >
      <div
        ref={thumbRef}
        className="pointer-events-none absolute right-[3px] top-0 w-[3px] rounded-full bg-white/35 opacity-0 transition-[opacity,width,background-color] duration-200 ease-out group-hover:w-[7px] group-hover:bg-white/50 group-hover:opacity-100 group-data-[awake]:opacity-100 group-data-[dragging]:w-[7px] group-data-[dragging]:bg-amber"
      />
    </div>
  );
}
