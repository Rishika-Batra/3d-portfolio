import React, { useEffect, useRef } from "react";

const LABELS = [
  "TypeScript",
  "Java",
  "Python",
  "React",
  "Node.js",
  "Full Stack",
  "PostgreSQL",
  "REST API",
  "Git",
  "CI/CD",
  "Docker",
];

const COLORS = ["#ec4899", "#b4a0dc", "#5edcbe"];

const getRandomColor = () => {
  const r = Math.random();
  if (r < 0.6) return COLORS[0]; // 60% pink
  if (r < 0.8) return COLORS[1]; // 20% lilac
  return COLORS[2]; // 20% teal
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label: string | null;
  phase: number;
  pulseTimer: number;
}

const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    const mouse = { x: -1000, y: -1000 };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const initNodes = () => {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 30 : 60;
      nodes = [];
      for (let i = 0; i < count; i++) {
        const hasLabel = Math.random() < 0.2; // ~20% of nodes
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 0.7 + Math.random() * 1.3,
          color: getRandomColor(),
          label: hasLabel
            ? LABELS[Math.floor(Math.random() * LABELS.length)]
            : null,
          phase: Math.random() * Math.PI * 2,
          pulseTimer: 0,
        });
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initNodes();
    };

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Only care if the click is somewhat near the canvas bounds 
      // (though it responds anywhere, we just map it)
      let nearestNode: Node | null = null;
      let minDist = Infinity;

      nodes.forEach((n) => {
        const dist = Math.hypot(n.x - cx, n.y - cy);
        if (dist < minDist) {
          minDist = dist;
          nearestNode = n;
        }
      });

      if (nearestNode) {
        nearestNode.pulseTimer = 1.0;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    let lastTime = performance.now();

    const draw = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      nodes.forEach((n) => {
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          n.phase += dt * 1.5;
        }

        if (n.pulseTimer > 0) {
          n.pulseTimer = Math.max(0, n.pulseTimer - dt);
        }

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const opacity = (1 - dist / 140) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        nodes.forEach((n) => {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 190) {
            const opacity = (1 - dist / 190) * 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(236, 72, 153, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      nodes.forEach((n) => {
        let baseOpacity = prefersReducedMotion
          ? 0.9
          : 0.7 + Math.sin(n.phase) * 0.3;

        let currentRadius = n.radius;
        let glow = false;

        if (n.pulseTimer > 0) {
          const pulseEased = 1 - Math.pow(1 - n.pulseTimer, 3);
          currentRadius = n.radius + pulseEased * 3;
          baseOpacity = Math.min(1, baseOpacity + pulseEased * 0.5);
          glow = true;
        } else if (baseOpacity > 0.7) {
          glow = true;
        }

        const r = parseInt(n.color.slice(1, 3), 16);
        const g = parseInt(n.color.slice(3, 5), 16);
        const b = parseInt(n.color.slice(5, 7), 16);

        if (glow) {
          ctx.save();
          ctx.beginPath();
          const glowRadius = currentRadius * 4;
          const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.8})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity})`;
        ctx.fill();

        if (n.label) {
          ctx.font = "11px monospace";
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.7})`;
          ctx.fillText(n.label, n.x + 6, n.y + 3);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
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
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

export default ConstellationBackground;
