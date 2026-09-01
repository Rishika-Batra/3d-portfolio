import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./styles/CosmicGlobe.css";

// ---------------------------------------------------------------------------
// Starfield — generates once
// ---------------------------------------------------------------------------
interface Star { x: string; y: string; size: string; opacity: number; bright: boolean }
const STARS: Star[] = Array.from({ length: 175 }, (_, i) => {
  const bright = i < 9; // ~5% foreground stars — bigger, fully opaque
  return {
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: bright ? `${2.5 + Math.random() * 0.8}px` : `${1 + Math.random() * 2}px`,
    opacity: bright ? 0.85 + Math.random() * 0.15 : 0.2 + Math.random() * 0.8,
    bright,
  };
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const CosmicGlobe = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Start with a non-zero fallback — ResizeObserver will correct it immediately
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 5.2; // Pulled back so the 3.4 diameter sphere doesn't clip on top/bottom

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    // Don't call setSize yet — let ResizeObserver set it after CSS layout
    mount.appendChild(renderer.domElement);

    // ── Lights ────────────────────────────────────────────────────────────
    // Very low ambient light so the shadow side falls off to near-black
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    
    // Strong directional light from the side to create the "half moon" look
    const dir = new THREE.DirectionalLight(0xffffff, 2.5);
    dir.position.set(-4, 0.5, 1.5);
    scene.add(dir);

    // ── Globe ─────────────────────────────────────────────────────────────
    const geo = new THREE.SphereGeometry(1.7, 64, 64); // 64x64 for perfectly smooth, round edges
    const loader = new THREE.TextureLoader();
    const mat = new THREE.MeshPhongMaterial({
      map: loader.load(
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      ),
      color: 0xd4537e, // Tint the texture pink directly in the 3D material
      specular: new THREE.Color(0x000000), // No glossy dot
      shininess: 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Offset right so ~45% of sphere bleeds off the right edge
    mesh.position.x = 0.85;
    scene.add(mesh);

    // ── Animation ─────────────────────────────────────────────────────────
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    // ── ResizeObserver — fires after CSS layout settles ───────────────────
    // This is the KEY fix: captures the actual rendered container size
    // (600×600 from .globe-accent) instead of a stale pre-layout value.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    ro.observe(mount);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="cosmic-globe-wrapper">
      {/* Nebula cloud blobs — blurred radial gradients with mix-blend: screen */}
      <div className="cosmic-nebula" />
      <div className="cosmic-nebula-accent" />

      {/* Starfield */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className={`cosmic-star${s.bright ? " cosmic-star--bright" : ""}`}
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {/* Three.js canvas mount */}
      <div ref={mountRef} className="cosmic-globe-canvas" />
    </div>
  );
};

export default CosmicGlobe;
