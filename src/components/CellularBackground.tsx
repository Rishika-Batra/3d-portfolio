import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Simplex-like permutation noise (compact, no dependencies needed)
// ---------------------------------------------------------------------------
const perm = (() => {
  const p = new Uint8Array(512);
  const base = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,
    142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,
    203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
    74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,
    220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,
    132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,
    186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,
    206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,
    163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,
    224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,
    179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
    184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,
    24,72,243,141,128,195,78,66,215,61,156,180
  ];
  for (let i = 0; i < 256; i++) p[i] = base[i];
  for (let i = 0; i < 256; i++) p[256 + i] = p[i];
  return p;
})();

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);
const grad3 = (hash: number, x: number, y: number, z: number) => {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const noise3 = (x: number, y: number, z: number): number => {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A  = perm[X] + Y,  AA = perm[A] + Z, AB = perm[A + 1] + Z;
  const B  = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  return lerp(w,
    lerp(v,
      lerp(u, grad3(perm[AA],   x,   y,   z), grad3(perm[BA],   x-1, y,   z)),
      lerp(u, grad3(perm[AB],   x,   y-1, z), grad3(perm[BB],   x-1, y-1, z))
    ),
    lerp(v,
      lerp(u, grad3(perm[AA+1], x,   y,   z-1), grad3(perm[BA+1], x-1, y,   z-1)),
      lerp(u, grad3(perm[AB+1], x,   y-1, z-1), grad3(perm[BB+1], x-1, y-1, z-1))
    )
  );
};

// ---------------------------------------------------------------------------
// Color ramp  0 → #0a0410  ~0.45 → #2a0a2a  ~0.65 → #6e1450  ~0.85 → #ec4899  1 → #ffcde6
// ---------------------------------------------------------------------------
const COLOR_STOPS: [number, [number, number, number]][] = [
  [0.00, [10,  4, 16]],
  [0.45, [42, 10, 42]],
  [0.65, [110,20, 80]],
  [0.85, [236,72,153]],
  [1.00, [255,205,230]],
];

function rampColor(t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const [s0, c0] = COLOR_STOPS[i - 1];
    const [s1, c1] = COLOR_STOPS[i];
    if (t <= s1) {
      const f = (t - s0) / (s1 - s0);
      return [
        Math.round(c0[0] + f * (c1[0] - c0[0])),
        Math.round(c0[1] + f * (c1[1] - c0[1])),
        Math.round(c0[2] + f * (c1[2] - c0[2])),
      ];
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1];
}

// ---------------------------------------------------------------------------
// Feature point type
// ---------------------------------------------------------------------------
interface FP { x: number; y: number; angle: number; speed: number }

const mkFP = (w: number, h: number): FP => ({
  x: Math.random() * w,
  y: Math.random() * h,
  angle: Math.random() * Math.PI * 2,
  speed: 0.18 + Math.random() * 0.22,
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const CellularBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Offscreen canvas for the low-res grid
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d")!;

    let W = 0, H = 0;           // display size
    let GW = 0, GH = 0;         // grid cells
    const CELL = 7;             // px per grid cell
    const NUM_FP = 10;
    const SOFTNESS = 9000;      // controls seam width
    const WARP_SCALE = 0.003;
    const WARP_AMP = 130;       // pixels
    const TIME_SCALE = 0.00018;

    let fps: FP[] = [];
    let imgData: ImageData;

    // Mouse tracking (smoothed)
    const rawMouse = { x: -9999, y: -9999, active: false };
    const smoothMouse = { x: -9999, y: -9999 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      rawMouse.x = e.clientX - rect.left;
      rawMouse.y = e.clientY - rect.top;
      rawMouse.active = true;
    };
    const onPointerLeave = () => { rawMouse.active = false; };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      W = rect.width; H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);

      GW = Math.ceil(W / CELL) + 1;
      GH = Math.ceil(H / CELL) + 1;
      offscreen.width = GW;
      offscreen.height = GH;
      imgData = offCtx.createImageData(GW, GH);

      fps = Array.from({ length: NUM_FP }, () => mkFP(W, H));
    };

    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    let lastT = 0;

    const tick = (t: number) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      // --- smooth mouse lerp ---
      if (rawMouse.active) {
        smoothMouse.x += (rawMouse.x - smoothMouse.x) * 0.08;
        smoothMouse.y += (rawMouse.y - smoothMouse.y) * 0.08;
      }

      // --- drift feature points ---
      if (!reduced) {
        fps.forEach(fp => {
          fp.angle += (Math.random() - 0.5) * 0.04;
          fp.x += Math.cos(fp.angle) * fp.speed;
          fp.y += Math.sin(fp.angle) * fp.speed;
          if (fp.x < 0) fp.x += W;
          if (fp.x > W) fp.x -= W;
          if (fp.y < 0) fp.y += H;
          if (fp.y > H) fp.y -= H;
        });
      }

      // Build effective points list (add cursor point when active)
      const pts = [...fps];
      if (!reduced && rawMouse.active) {
        pts.push({ x: smoothMouse.x, y: smoothMouse.y, angle: 0, speed: 0 });
      }

      const timeVal = t * TIME_SCALE;

      // --- fill low-res grid ---
      const data = imgData.data;
      for (let gy = 0; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
          // sample world coords
          const sx = gx * CELL;
          const sy = gy * CELL;

          // warp coordinates using two independent noise channels
          const wx = sx + noise3(sx * WARP_SCALE, sy * WARP_SCALE,         timeVal) * WARP_AMP;
          const wy = sy + noise3(sx * WARP_SCALE + 31.7, sy * WARP_SCALE + 17.3, timeVal) * WARP_AMP;

          // Voronoi F1 / F2 search
          let d1 = Infinity, d2 = Infinity;
          for (let p = 0; p < pts.length; p++) {
            const dx = wx - pts[p].x;
            const dy = wy - pts[p].y;
            const d  = dx * dx + dy * dy;
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
          }

          // edge metric and glow
          const edge = d2 - d1;
          const glow = Math.exp(-edge / SOFTNESS);

          // color ramp
          const [r, g, b] = rampColor(glow);
          const idx = (gy * GW + gx) * 4;
          data[idx]     = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // --- draw scaled to full canvas with smoothing ---
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(offscreen, 0, 0, W, H);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame((t) => { lastT = t; raf = requestAnimationFrame(tick); });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(18px)",
      }}
    />
  );
};

export default CellularBackground;
