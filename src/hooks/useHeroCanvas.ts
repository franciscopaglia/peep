import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  alpha: number;
  char: string;
  phase: number;
};

const CHARS = Array.from(
  '𐑐𐑑𐑒𐑚𐑛𐑜𐑓𐑝𐑕𐑟𐑞𐑨𐑦𐑪𐑳𐑮𐑤𐑥𐑯𐑰𐑴𐑵𐑢𐑗𐑖𐑡𐑘𐑙𐑻𐑼𐑽𐑾𐑿𐑹𐑺'
);

const PARTICLE_COUNT = 90;
// Lighten the effect on small screens: 25% fewer glyphs.
const MOBILE_BREAKPOINT = 640;

export function useHeroCanvas(active: boolean, isDark: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const dimsRef = useRef({ w: 0, h: 0, dpr: 1 });
  const tRef = useRef(0);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !canvas) return;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      dimsRef.current = { w: r.width, h: r.height, dpr };
    }

    function initParticles() {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const count = isMobile ? Math.round(PARTICLE_COUNT * 0.75) : PARTICLE_COUNT;
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        arr.push({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.00005 * (0.5 + depth),
          vy: (-0.00002 - Math.random() * 0.00005) * (0.5 + depth),
          size: 14 + depth * 58,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.0009,
          alpha: 0.03 + depth * 0.085,
          char: CHARS[i % CHARS.length],
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = arr;
    }

    function step() {
      tRef.current += 0.008;
      for (const p of particlesRef.current ?? []) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.x < -0.1) p.x = 1.1;
        if (p.x > 1.1) p.x = -0.1;
        if (p.y < -0.1) p.y = 1.1;
        if (p.y > 1.1) p.y = -0.1;
      }
    }

    function draw() {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const { w, h, dpr } = dimsRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const base = isDarkRef.current ? '235,238,255' : '40,44,74';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of particlesRef.current ?? []) {
        ctx.save();
        ctx.translate(p.x * w, p.y * h);
        ctx.rotate(p.rot);
        ctx.font = `700 ${p.size}px Inter, sans-serif`;
        ctx.fillStyle = `rgba(${base},${p.alpha * (0.75 + 0.25 * Math.sin(tRef.current + p.phase))})`;
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }
    }

    resize();
    if (!particlesRef.current) initParticles();

    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      draw();
    } else {
      const loop = () => {
        step();
        draw();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener('resize', onResize);
    };
    // `isDark` re-runs the effect so the one-off draw() under
    // prefers-reduced-motion repaints in the new theme colors.
  }, [active, isDark]);

  return canvasRef;
}
