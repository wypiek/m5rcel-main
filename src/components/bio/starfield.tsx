import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; r: number; phase: number; speed: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Full-screen drifting starfield with mouse parallax and the odd shooting star. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const still = reducedMotion();
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let width = 0;
    let height = 0;
    let frame = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((width * height) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() ** 2, // most stars far away
        r: Math.random() * 1.1 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.2,
      }));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      for (const s of stars) {
        if (!still) {
          s.y += (0.04 + s.z * 0.22) * s.speed;
          if (s.y > height + 4) {
            s.y = -4;
            s.x = Math.random() * width;
          }
        }
        const depth = 0.2 + s.z;
        const x = s.x - mouse.x * depth * 18;
        const y = s.y - mouse.y * depth * 18;
        const twinkle = still ? 0.8 : 0.55 + 0.45 * Math.sin(time * 0.0015 * s.speed + s.phase);
        ctx.globalAlpha = (0.25 + s.z * 0.75) * twinkle;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, s.r * (0.6 + s.z), 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting star, roughly every 6–12 seconds.
      if (!still) {
        if (!meteor && Math.random() < 0.0022) {
          meteor = { x: Math.random() * width * 0.8, y: Math.random() * height * 0.4, vx: 9, vy: 3.2, life: 1 };
        }
        if (meteor) {
          const m = meteor;
          const gradient = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10);
          gradient.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10);
          ctx.stroke();
          m.x += m.vx;
          m.y += m.vy;
          m.life -= 0.012;
          if (m.life <= 0 || m.x > width + 100) meteor = null;
        }
      }
      ctx.globalAlpha = 1;
      if (!still) frame = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / width - 0.5;
      mouse.ty = e.clientY / height - 0.5;
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; size: number; spin: number };

/** Little four-point sparkles that trail the mouse (desktop only, off with reduced motion). */
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const sparks: Spark[] = [];
    let frame = 0;
    let last = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const star = (x: number, y: number, size: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      // Four long points with pinched waists between them.
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? size : size * 0.28;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03;
        s.life -= 0.022;
        s.spin += 0.05;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = "#fff";
        star(s.x, s.y, s.size * s.life, s.spin);
      }
      frame = sparks.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (dist < 14) return;
      last = { x: e.clientX, y: e.clientY };
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8 - 0.3,
        life: 1,
        size: Math.random() * 4 + 3,
        spin: Math.random() * Math.PI,
      });
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
