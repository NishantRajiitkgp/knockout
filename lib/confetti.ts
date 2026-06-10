/**
 * Dependency-free confetti burst — two bottom cannons firing up and out.
 * Self-cleaning: appends a fixed canvas, animates ~4s, then removes itself.
 * Skips entirely when the user prefers reduced motion.
 */
const COLORS = ["#FFFFFF", "#7CF0BD", "#FFD24C", "#FF6363", "#8A6FF0", "#5BC0FF"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  round: boolean;
}

export function fireConfetti(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const particles: Particle[] = [];
  const spawn = (originX: number, baseAngle: number) => {
    for (let i = 0; i < 80; i++) {
      const a = (baseAngle + (Math.random() * 40 - 20)) * (Math.PI / 180);
      const speed = 9 + Math.random() * 9;
      particles.push({
        x: originX,
        y: H * 0.92,
        vx: Math.cos(a) * speed,
        vy: -Math.sin(a) * speed,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        size: 6 + Math.random() * 6,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        round: Math.random() > 0.55,
      });
    }
  };
  spawn(W * 0.18, 65); // bottom-left, up-right
  spawn(W * 0.82, 115); // bottom-right, up-left

  const gravity = 0.3;
  const drag = 0.992;
  const start = performance.now();
  let raf = 0;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    canvas.remove();
  };

  const frame = (t: number) => {
    const elapsed = t - start;
    ctx.clearRect(0, 0, W, H);
    const fade = elapsed > 1800 ? Math.max(0, 1 - (elapsed - 1800) / 1700) : 1;
    let alive = 0;

    for (const p of particles) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y < H + 40 && fade > 0) alive++;

      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      ctx.restore();
    }

    if (elapsed < 4200 && alive > 0) {
      raf = requestAnimationFrame(frame);
    } else {
      cleanup();
    }
  };

  raf = requestAnimationFrame(frame);
}
