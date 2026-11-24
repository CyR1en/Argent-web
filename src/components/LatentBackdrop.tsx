"use client";

import React, { useEffect, useRef } from "react";

/** A cell's side in CSS pixels. The canvas holds one texel per cell and is scaled up unsmoothed. */
const CELL = 2;
const TRAIL_CAPACITY = 20;
/** How fast the field drifts against the page as it scrolls: a layer far behind the content. */
const PARALLAX = 0.3;
/** The field's strength over a section that sets none. */
const DEFAULT_LEVEL = 0.5;
/** The clock a still frame is drawn at when motion is reduced. */
const STILL_TIME = 12;

const VERT_SRC = `#version 300 es
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(POS[gl_VertexID], 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;
uniform vec2 u_cells;
uniform float u_time;
uniform float u_scroll;
uniform float u_level;
uniform vec2 u_glow;
uniform vec4 u_column;
uniform float u_columnFalloff;
uniform vec4 u_pointer;
uniform vec4 u_ink;
uniform vec4 u_accent;
uniform float u_intro;
uniform vec4 u_trail[${TRAIL_CAPACITY}];
out vec4 fragColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s / 0.9375;
}

float clouds(vec2 p, float t, float sc) {
  vec2 q = p / sc;
  vec2 w = vec2(fbm(q + vec2(t * 0.020, 3.1)), fbm(q + vec2(5.2, 1.3 - t * 0.016)));
  return fbm(q + 1.9 * w + vec2(-t * 0.010, t * 0.007));
}

float bayer2(vec2 a) {
  a = mod(floor(a), 2.0);
  return fract(a.x * 0.5 + a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float sdBox(vec2 p, vec4 r, float rad) {
  vec2 c = r.xy + r.zw * 0.5;
  vec2 q = abs(p - c) - r.zw * 0.5 + rad;
  return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - rad;
}

void main() {
  // One fragment per cell, counted from the field's top left; p is the cell's centre in CSS pixels.
  vec2 cell = vec2(floor(gl_FragCoord.x), u_cells.y - 1.0 - floor(gl_FragCoord.y));
  vec2 size = u_cells * ${CELL.toFixed(1)};
  vec2 p = (cell + 0.5) * ${CELL.toFixed(1)};
  float t = u_time;

  // The column of words stays nearly clear, with no edge to show where the clearing ends.
  float calm = 1.0;
  if (u_columnFalloff > 0.0) {
    calm = mix(0.2, 1.0, smoothstep(0.0, u_columnFalloff, sdBox(p, u_column, 64.0)));
  }

  // The pointer's light: a pool where it is, wider while it rests, and the fading trail behind it.
  vec2 dp = p - u_pointer.xy;
  float r0 = 56.0 + 44.0 * u_pointer.w;
  float e = u_pointer.z * exp(-dot(dp, dp) / (r0 * r0));
  for (int i = 0; i < ${TRAIL_CAPACITY}; i++) {
    vec4 s = u_trail[i];
    if (s.w < 0.5) continue;
    float rs = 48.0 + s.z * 38.0;
    vec2 d = p - s.xy;
    e += 0.42 * exp(-dot(d, d) / (rs * rs)) * exp(-s.z * 1.5);
  }

  // The pointer plays over the open field only: where a section dims the field for its content, it dims too.
  e *= smoothstep(0.45, 0.95, u_level);

  // The safelight: a warm pool on the horizon where the page closes. u_glow is its strength and its y.
  vec2 gp = (p - vec2(size.x * 0.5, u_glow.y)) / vec2(size.x * 0.44, size.y * 0.46);
  e += u_glow.x * 1.2 * exp(-dot(gp, gp));

  float el = (1.0 - exp(-1.25 * e)) * mix(0.16, 1.0, calm);

  vec2 uv = p / size - 0.5;
  float vig = smoothstep(0.2, 0.8, length(uv * vec2(1.0, 1.12)));
  float a = clamp(el * 1.5, 0.0, 1.0);
  float c = clouds(p + vec2(0.0, u_scroll), t, 340.0);
  float field = (0.014 + 0.04 * vig + smoothstep(0.38, 0.70, c) * (0.30 + 0.12 * vig)) * calm;
  float cov = (field * u_level + el * 0.5) * u_intro;

  if (cov < bayer8(cell) * 0.985 + 0.002) {
    fragColor = vec4(0.0);
    return;
  }

  float alpha = u_ink.w * (1.0 + 0.5 * a);
  fragColor = vec4(mix(u_ink.rgb, u_accent.rgb, a * 0.8) * alpha, alpha);
}
`;

const UNIFORMS = [
  "u_cells",
  "u_time",
  "u_scroll",
  "u_level",
  "u_glow",
  "u_column",
  "u_columnFalloff",
  "u_pointer",
  "u_ink",
  "u_accent",
  "u_intro",
  "u_trail",
] as const;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function link(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

/**
 * The Latent image from Argent's Open roll page, ported from its Metal shader: a fixed lattice of
 * cells behind the whole page, each lit or not by comparing its coverage with an ordered threshold.
 *
 * It reads the page through three attributes. `data-backdrop="0..1"` on a section sets the field's
 * strength while that section holds the middle of the viewport. `data-backdrop-calm` marks a column
 * of words the field keeps clear. `data-backdrop-glow` marks the section whose arrival brings up
 * a warm pool along its bottom edge.
 *
 * Without WebGL2 the page keeps its plain ground.
 */
export function LatentBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    const program = gl && link(gl);
    if (!gl || !program) return;

    const uniform = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])
    ) as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
    const vao = gl.createVertexArray();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-backdrop]"));
    const calmColumns = Array.from(document.querySelectorAll<HTMLElement>("[data-backdrop-calm]"));
    const glowSection = document.querySelector<HTMLElement>("[data-backdrop-glow]");

    const pointer = { x: 0, y: 0, target: 0, presence: 0, dwell: 0, lastMove: 0 };
    const trail: { x: number; y: number; age: number }[] = [];
    const trailFlat = new Float32Array(TRAIL_CAPACITY * 4);
    let level = Number(sections[0]?.dataset.backdrop ?? DEFAULT_LEVEL);
    let glow = 0;
    let cells = { x: 1, y: 1 };
    let rafId = 0;
    const start = performance.now();
    let previous = start;

    const resize = () => {
      cells = {
        x: Math.max(1, Math.ceil(host.clientWidth / CELL)),
        y: Math.max(1, Math.ceil(host.clientHeight / CELL)),
      };
      canvas.width = cells.x;
      canvas.height = cells.y;
      canvas.style.width = `${cells.x * CELL}px`;
      canvas.style.height = `${cells.y * CELL}px`;
      gl.viewport(0, 0, cells.x, cells.y);
    };

    /** The strength the page asks for now, the pool's rise, and the column to keep clear. */
    const readPage = () => {
      const viewport = window.innerHeight;
      const middle = viewport / 2;
      let targetLevel = DEFAULT_LEVEL;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= middle && rect.bottom > middle) {
          targetLevel = Number(section.dataset.backdrop);
          break;
        }
      }

      const glowRect = glowSection?.getBoundingClientRect();
      const targetGlow = glowRect ? Math.min(1, Math.max(0, (viewport - glowRect.top) / (viewport * 0.85))) : 0;
      const glowY = glowRect ? glowRect.bottom : viewport;

      let column: [number, number, number, number] = [0, 0, 0, 0];
      let falloff = 0;
      for (const element of calmColumns) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) continue;
        const margin = 10;
        const x = rect.left - margin;
        const width = rect.width + margin * 2;
        const room = Math.max(0, Math.min(x, host.clientWidth - (x + width)));
        column = [x, rect.top - margin, width, rect.height + margin * 2];
        falloff = Math.min(190, Math.max(64, 0.8 * room));
        break;
      }

      return { targetLevel, targetGlow, glowY, column, falloff };
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      const page = readPage();

      if (still) {
        level = page.targetLevel;
        glow = page.targetGlow;
      } else {
        const ease = 1 - Math.exp(-dt * 3.2);
        level += (page.targetLevel - level) * ease;
        glow += (page.targetGlow - glow) * (1 - Math.exp(-dt * 6));
        pointer.presence += (pointer.target - pointer.presence) * (1 - Math.exp(-dt * 7));
        const resting = now - pointer.lastMove > 150;
        pointer.dwell =
          pointer.target > 0 && resting
            ? Math.min(1, pointer.dwell + dt * 0.7)
            : Math.max(0, pointer.dwell - dt * 1.3);
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].age += dt;
          if (trail[i].age > 1.8) trail.splice(i, 1);
        }
      }

      trailFlat.fill(0);
      trail.forEach((sample, i) => {
        trailFlat.set([sample.x, sample.y, sample.age, 1], i * 4);
      });

      const elapsed = (now - start) / 1000;
      const intro = still ? 1 : 1 - Math.pow(1 - Math.min(1, elapsed / 0.85), 3);

      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(uniform.u_cells, cells.x, cells.y);
      gl.uniform1f(uniform.u_time, still ? STILL_TIME : elapsed);
      gl.uniform1f(uniform.u_scroll, still ? 0 : window.scrollY * PARALLAX);
      gl.uniform1f(uniform.u_level, level);
      gl.uniform2f(uniform.u_glow, glow, page.glowY);
      gl.uniform4f(uniform.u_column, ...page.column);
      gl.uniform1f(uniform.u_columnFalloff, page.falloff);
      gl.uniform4f(uniform.u_pointer, pointer.x, pointer.y, pointer.presence, pointer.dwell);
      gl.uniform4f(uniform.u_ink, 216 / 255, 216 / 255, 212 / 255, 0.16);
      gl.uniform4f(uniform.u_accent, 229 / 255, 186 / 255, 84 / 255, 1);
      gl.uniform1f(uniform.u_intro, intro);
      gl.uniform4fv(uniform.u_trail, trailFlat);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      draw(now);
    };
    /** Under reduced motion the field holds still and is redrawn only when the page moves under it. */
    const redraw = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6) {
        trail.unshift({ x: event.clientX, y: event.clientY, age: 0 });
        if (trail.length > TRAIL_CAPACITY) trail.pop();
        pointer.lastMove = performance.now();
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.target = 1;
    };
    const onPointerLeave = () => {
      pointer.target = 0;
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (still) redraw();
    });
    observer.observe(host);
    resize();

    if (still) {
      window.addEventListener("scroll", redraw, { passive: true });
      redraw();
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", redraw);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh overflow-hidden">
      <canvas ref={canvasRef} className="block [image-rendering:pixelated]" />
    </div>
  );
}
