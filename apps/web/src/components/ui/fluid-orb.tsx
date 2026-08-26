"use client";

import React, { useEffect, useRef, type FC } from "react";
import { cn } from "../../lib/utils.js";

export type OrbState = "IDLE" | "CONNECTING" | "LISTENING" | "SPEAKING" | "PROCESSING";

export interface FluidOrbProps extends React.ComponentProps<"div"> {
  size?: number;
  color?: string;
  state?: OrbState;
  className?: string;
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.6;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.22;

  vec2 drift = vec2(
    sin(t) + 0.6 * sin(t * 1.7 + 1.3),
    cos(t * 0.8) + 0.6 * cos(t * 1.3 + 2.1)
  );

  vec2 p = vec2(uv.x * 1.8, uv.y * 1.0) + drift * 0.7;
  vec2 q = vec2(fbm(p + drift), fbm(p + vec2(3.2, 1.5) - drift));
  float f = fbm(p + 1.2 * q);

  float g = clamp(1.0 - uv.y, 0.0, 1.0);
  float anchor = smoothstep(0.0, 0.3, uv.y);
  float shade = clamp(g + (f - 0.5) * 0.8 * anchor, 0.0, 1.0);

  vec3 white = vec3(0.99, 1.0, 1.0);
  vec3 light = mix(white, u_color, 0.45);
  vec3 dark = u_color;

  vec3 col = white;
  col = mix(col, light, smoothstep(0.28, 0.52, shade));
  col = mix(col, dark, smoothstep(0.58, 0.88, shade));

  float edge = smoothstep(0.5, 0.49, distance(uv, vec2(0.5)));
  gl_FragColor = vec4(col * edge, edge);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [0.976, 0.451, 0.086]; // Raksha warm orange default
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export const FluidOrb: FC<FluidOrbProps> = ({
  size = 240,
  color = "#f97316",
  state = "LISTENING",
  className,
  style,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<OrbState>(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    let vert: WebGLShader | null = null;
    let frag: WebGLShader | null = null;
    let buffer: WebGLBuffer | null = null;
    let raf = 0;
    let accumulatedTime = 0;
    let lastTimestamp = performance.now();
    let isVisible = true;

    function initGL() {
      if (!gl || !canvas) return false;
      program = gl.createProgram();
      vert = compile(gl, gl.VERTEX_SHADER, VERT);
      frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!program || !vert || !frag) return false;

      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return false;
      }
      gl.useProgram(program);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform3f(gl.getUniformLocation(program, "u_color"), ...hexToRgb(color));
      return true;
    }

    if (!initGL()) return;

    const updateSize = () => {
      if (!canvas || !gl || !program) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetSize = containerRef.current ? containerRef.current.clientWidth || size : size;
      const px = Math.round(targetSize * dpr);
      if (px === 0) return;
      canvas.width = px;
      canvas.height = px;
      gl.viewport(0, 0, px, px);
      const uRes = gl.getUniformLocation(program, "u_resolution");
      if (uRes) gl.uniform2f(uRes, px, px);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const speedFactors: Record<OrbState, number> = {
      IDLE: 0.15,
      CONNECTING: 0.20,
      LISTENING: 0.50,
      SPEAKING: 0.85,
      PROCESSING: 0.35,
    };

    const render = (now: number) => {
      if (!gl || !program) return;
      const dt = (now - lastTimestamp) * 0.001;
      lastTimestamp = now;

      if (isVisible && !reduce) {
        const factor = speedFactors[stateRef.current] || 0.5;
        accumulatedTime += dt * factor;
        const uTime = gl.getUniformLocation(program, "u_time");
        if (uTime) gl.uniform1f(uTime, accumulatedTime);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      lastTimestamp = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };

    const onContextRestored = () => {
      initGL();
      updateSize();
      lastTimestamp = performance.now();
      raf = requestAnimationFrame(render);
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
      }
      if (gl && program) {
        gl.deleteProgram(program);
        if (vert) gl.deleteShader(vert);
        if (frag) gl.deleteShader(frag);
        if (buffer) gl.deleteBuffer(buffer);
      }
    };
  }, [size, color]);

  return (
    <div
      ref={containerRef}
      data-slot="fluid-orb"
      className={cn("relative overflow-hidden rounded-full flex items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full block rounded-full" />
    </div>
  );
};

export default FluidOrb;
