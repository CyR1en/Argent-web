"use client";

import React, { useEffect, useRef } from "react";

interface LatentBackdropProps {
  /** Optional calm element ref where Bayer lattice intensity eases slightly for text legibility. */
  calmElementRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

const TRAIL_CAPACITY = 20;

const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
void main() {
  gl_Position = vec4(POS[gl_VertexID], 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;
uniform vec2 u_size;
uniform float u_cellPoints;
uniform float u_time;
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
  vec2 cell = floor(gl_FragCoord.xy / u_cellPoints);
  vec2 p = vec2((cell.x + 0.5) * u_cellPoints, u_size.y - (cell.y + 0.5) * u_cellPoints);
  float t = u_time;

  float calm = 1.0;
  if (u_columnFalloff > 0.0) {
    float calmD = sdBox(p, u_column, 20.0);
    calm = smoothstep(0.0, u_columnFalloff, calmD);
  }

  vec2 dp = p - u_pointer.xy;
  float r0 = 60.0 + 48.0 * u_pointer.w;
  float e = u_pointer.z * exp(-dot(dp, dp) / (r0 * r0));
  for (int i = 0; i < ${TRAIL_CAPACITY}; i++) {
    vec4 s = u_trail[i];
    if (s.w < 0.5) continue;
    float rs = 50.0 + s.z * 38.0;
    vec2 d = p - s.xy;
    e += 0.42 * exp(-dot(d, d) / (rs * rs)) * exp(-s.z * 1.5);
  }

  // Subtle ambient warm golden-amber corner radiance echoing Rolls view screenshot
  vec2 corner = p - vec2(u_size.x * 0.90, u_size.y * 0.85);
  float cornerPool = 0.34 * exp(-dot(corner, corner) / (320.0 * 320.0));

  float el = (1.0 - exp(-1.25 * (e + cornerPool))) * mix(0.28, 1.0, calm);
  vec2 uv = p / max(u_size, vec2(1.0)) - 0.5;
  float vig = smoothstep(0.18, 0.85, length(uv * vec2(1.0, 1.1)));
  float a = clamp(el * 1.5, 0.0, 1.0);
  float c = clouds(p, t, 340.0);
  float cov = (0.015 + 0.045 * vig + smoothstep(0.38, 0.70, c) * (0.30 + 0.12 * vig)) * mix(0.35, 1.0, calm) + el * 0.52;
  cov *= u_intro;

  float thr = bayer8(cell);
  if (cov < thr * 0.985 + 0.002) {
    fragColor = vec4(0.0);
    return;
  }

  float alpha = u_ink.w * (1.0 + 0.65 * a);
  vec3 col = mix(u_ink.rgb, u_accent.rgb, a * 0.88);
  fragColor = vec4(col * alpha, alpha);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/**
 * WebGL2 port of Argent's Swift/Metal OpenRollBackdropShader tuned to match the app's
 * dark carbon dot-matrix lattice and warm golden-amber light pool.
 */
export function LatentBackdrop({ calmElementRef, className = "" }: LatentBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -999, y: -999, presence: 0, dwell: 0, lastMove: 0 };
    const trail: { x: number; y: number; age: number }[] = [];
    let isVisible = true;
    let rafId = 0;

    const getCalmRect = () => {
      const hostRect = canvas.getBoundingClientRect();
      const target = calmElementRef?.current;
      if (!target) return { rect: [0, 0, 0, 0] as [number, number, number, number], falloff: 0 };
      const r = target.getBoundingClientRect();
      const margin = 12;
      const x = r.left - hostRect.left - margin;
      const y = r.top - hostRect.top - margin;
      const w = r.width + margin * 2;
      const h = r.height + margin * 2;
      const room = Math.max(0, Math.min(x, hostRect.width - (x + w)));
      const falloff = Math.min(110, Math.max(48, 0.6 * room));
      return { rect: [x, y, w, h] as [number, number, number, number], falloff };
    };

    const drawStatic2D = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      const step = 6;
      const bayer4 = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const nx = x / w - 0.55;
          const ny = y / h - 0.45;
          const field = Math.sin(x * 0.008) * Math.cos(y * 0.009) * 0.5 + 0.5;
          const vig = Math.min(1, Math.hypot(nx, ny * 1.1) * 1.3);
          const cov = 0.04 + 0.16 * field * vig;
          const thr = bayer4[(y / step) & 3][(x / step) & 3] / 16;
          if (cov > thr) {
            ctx.fillStyle = "rgba(216, 216, 212, 0.14)";
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    };

    if (reducedMotion) {
      drawStatic2D();
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });

    if (!gl) {
      drawStatic2D();
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) {
      drawStatic2D();
      return;
    }

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      drawStatic2D();
      return;
    }

    const vao = gl.createVertexArray();
    const uSize = gl.getUniformLocation(prog, "u_size");
    const uCell = gl.getUniformLocation(prog, "u_cellPoints");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uColumn = gl.getUniformLocation(prog, "u_column");
    const uFalloff = gl.getUniformLocation(prog, "u_columnFalloff");
    const uPointer = gl.getUniformLocation(prog, "u_pointer");
    const uInk = gl.getUniformLocation(prog, "u_ink");
    const uAccent = gl.getUniformLocation(prog, "u_accent");
    const uIntro = gl.getUniformLocation(prog, "u_intro");
    const uTrail = gl.getUniformLocation(prog, "u_trail");

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || window.innerWidth;
      const ch = canvas.clientHeight || window.innerHeight;
      width = cw;
      height = ch;
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientY < rect.top ||
        e.clientY > rect.bottom ||
        e.clientX < rect.left ||
        e.clientX > rect.right
      ) {
        pointer.presence = 0;
        return;
      }
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dist = Math.hypot(x - pointer.x, y - pointer.y);
      if (dist > 6) {
        trail.unshift({ x, y, age: 0 });
        if (trail.length > TRAIL_CAPACITY) trail.pop();
        pointer.lastMove = performance.now();
        pointer.dwell = Math.max(0, pointer.dwell - 0.15);
      }
      pointer.x = x;
      pointer.y = y;
      pointer.presence = 1;
    };

    const onPointerLeave = () => {
      pointer.presence = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const start = performance.now();
    let prev = start;
    const trailFlat = new Float32Array(TRAIL_CAPACITY * 4);

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (!isVisible || document.hidden) {
        prev = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      prev = now;
      const elapsed = (now - start) / 1000;

      if (pointer.presence > 0) {
        const restSeconds = (now - pointer.lastMove) / 1000;
        pointer.dwell =
          restSeconds > 0.15
            ? Math.min(1, pointer.dwell + dt * 0.7)
            : Math.max(0, pointer.dwell - dt * 1.4);
      } else {
        pointer.dwell = Math.max(0, pointer.dwell - dt * 1.2);
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += dt;
        if (trail[i].age > 1.8) trail.splice(i, 1);
      }
      trailFlat.fill(0);
      for (let i = 0; i < trail.length; i++) {
        trailFlat[i * 4] = trail[i].x;
        trailFlat[i * 4 + 1] = trail[i].y;
        trailFlat[i * 4 + 2] = trail[i].age;
        trailFlat[i * 4 + 3] = 1;
      }

      const dpr = canvas.width / Math.max(1, width);
      const calm = getCalmRect();
      const intro = Math.min(1, elapsed / 0.85);
      const easedIntro = 1 - Math.pow(1 - intro, 3);

      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uCell, 2.0 * dpr);
      gl.uniform1f(uTime, elapsed);
      gl.uniform4f(uColumn, calm.rect[0], calm.rect[1], calm.rect[2], calm.rect[3]);
      gl.uniform1f(uFalloff, calm.falloff);
      gl.uniform4f(uPointer, pointer.x, pointer.y, pointer.presence, pointer.dwell);
      gl.uniform4f(uInk, 216 / 255, 216 / 255, 212 / 255, 0.15);
      gl.uniform4f(uAccent, 229 / 255, 186 / 255, 84 / 255, 1.0);
      gl.uniform1f(uIntro, easedIntro);
      gl.uniform4fv(uTrail, trailFlat);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [calmElementRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
