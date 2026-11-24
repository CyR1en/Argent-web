import type Lenis from "lenis";

/**
 * A scroll frame reads layout and returns the writes it wants. Every frame reads before any
 * frame writes, so no reader forces a layout that another's writes just dirtied.
 */
type ScrollFrame = () => (() => void) | void;

const frames = new Set<ScrollFrame>();
let queued = false;
let lenis: Lenis | null = null;

function flush() {
  queued = false;
  const writes: (() => void)[] = [];
  frames.forEach((frame) => {
    const write = frame();
    if (write) writes.push(write);
  });
  writes.forEach((write) => write());
}

function request() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

/** Runs `frame` once now and then once per animation frame in which the page scrolled or resized. */
export function onScrollFrame(frame: ScrollFrame): () => void {
  if (frames.size === 0) {
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
  }
  frames.add(frame);
  request();
  return () => {
    frames.delete(frame);
    if (frames.size === 0) {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    }
  };
}

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Scrolls the page to `y`, through Lenis when it is running so its position stays in step. */
export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Hermite ease of `value` between two edges, 0 below the first and 1 above the second. */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
