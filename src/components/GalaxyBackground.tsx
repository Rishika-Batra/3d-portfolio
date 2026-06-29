import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleDir: number;
  accent: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  tailLen: number;
}

const StarfieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    /* ─── Stars ────────────────────────────────────────────── */
    const NUM = 520;
    const stars: Star[] = [];

    for (let i = 0; i < NUM; i++) {
      const roll = Math.random();
      // 80% tiny · 17% small · 3% medium
      const size =
        roll < 0.80 ? Math.random() * 0.55 + 0.15   // 0.15 – 0.70
        : roll < 0.97 ? Math.random() * 0.70 + 0.70  // 0.70 – 1.40
        : Math.random() * 0.60 + 1.40;               // 1.40 – 2.00

      // Parallax drift: larger (closer) stars move faster
      // Base 0.06–0.18 px/frame for tiny; 0.20–0.45 for medium
      const baseSpeed = 0.06 + Math.random() * 0.12;
      const parallax = 0.8 + (size / 2.0) * 1.8;    // 0.86 (tiny) → 2.6 (large)
      const speed = baseSpeed * parallax;

      // All stars drift slowly in the same general rightward direction
      // with slight individual variance — gives "rotating sky" feel
      const angle = -0.15 + (Math.random() - 0.5) * 0.6; // mostly rightward ±30°
      const accent = Math.random() < 0.03;

      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        alpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.004 + 0.001,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        accent,
      });
    }

    /* ─── Shooting stars ─────────────────────────────────── */
    const shooters: ShootingStar[] = [];
    let shootTimer = 0;
    const SHOOT_EVERY = 720; // ~12 s at 60 fps

    const spawnShooter = () => {
      const angle = -Math.PI / 5 + (Math.random() - 0.5) * 0.3;
      const speed = 5 + Math.random() * 4;
      shooters.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        tailLen: 90 + Math.random() * 60,
        alpha: 1,
        life: 0,
        maxLife: 55 + Math.random() * 25,
      });
    };

    /* ─── Render ─────────────────────────────────────────── */
    const render = () => {
      // Solid deep-space black every frame — no trail effect
      ctx.fillStyle = "#02010a";
      ctx.fillRect(0, 0, W, H);

      // Barely-visible nebula wisps for depth
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const neb1 = ctx.createRadialGradient(W * 0.22, H * 0.3, 0, W * 0.22, H * 0.3, W * 0.35);
      neb1.addColorStop(0, "rgba(40, 30, 90, 0.07)");
      neb1.addColorStop(0.6, "rgba(20, 15, 50, 0.02)");
      neb1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, W, H);

      const neb2 = ctx.createRadialGradient(W * 0.78, H * 0.72, 0, W * 0.78, H * 0.72, W * 0.28);
      neb2.addColorStop(0, "rgba(60, 10, 40, 0.05)");
      neb2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, W, H);

      ctx.restore();

      /* Stars — drift, wrap, twinkle */
      for (const s of stars) {
        // Move
        s.x += s.vx;
        s.y += s.vy;

        // Wrap seamlessly at edges
        if (s.x > W + 4) s.x = -4;
        if (s.x < -4)    s.x = W + 4;
        if (s.y > H + 4) s.y = -4;
        if (s.y < -4)    s.y = H + 4;

        // Gentle twinkle
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 0.92) { s.alpha = 0.92; s.twinkleDir = -1; }
        if (s.alpha <= 0.12) { s.alpha = 0.12; s.twinkleDir = 1; }

        ctx.globalAlpha = s.alpha;

        // Subtle halo on medium+ stars only
        if (s.size >= 1.4) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.5);
          g.addColorStop(0, s.accent
            ? `rgba(255,180,200,${s.alpha * 0.25})`
            : `rgba(200,215,255,${s.alpha * 0.18})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = s.accent
          ? `rgba(255,200,220,${s.alpha})`
          : s.size > 1.2
            ? `rgba(230,235,255,${s.alpha})`
            : `rgba(255,255,255,${s.alpha})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Shooting stars */
      shootTimer++;
      if (shootTimer >= SHOOT_EVERY) { spawnShooter(); shootTimer = 0; }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const ss = shooters[i];
        ss.life++;
        const t = ss.life / ss.maxLife;
        ss.alpha = t < 0.15 ? t / 0.15 : 1 - ((t - 0.15) / 0.85);
        ss.alpha = Math.max(0, ss.alpha);

        const tailX = ss.x - ss.vx * (ss.tailLen / 9);
        const tailY = ss.y - ss.vy * (ss.tailLen / 9);

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.7, `rgba(220,230,255,${ss.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${ss.alpha * 0.9})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();
        ctx.restore();

        ss.x += ss.vx;
        ss.y += ss.vy;
        if (ss.life >= ss.maxLife) shooters.splice(i, 1);
      }

      raf = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
};

export default StarfieldBackground;
