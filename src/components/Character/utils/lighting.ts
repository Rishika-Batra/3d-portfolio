import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0x5eead4, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x22d3ee, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr?v=2", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0;
      scene.environmentRotation.set(5.76, 85.85, 1);
    });

  function setPointLight(screenLight: any) {
    if (screenLight.material.opacity > 0.9) {
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      pointLight.intensity = 0;
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights(theme: "dark" | "light") {
    const isDark = theme === "dark";
    const envInt = isDark ? 0.64 : 1.2;
    
    // Set initial color based on theme
    if (!isDark) {
      directionalLight.color.setHex(0xd9006c);
      pointLight.color.setHex(0x7c3aed);
    } else {
      directionalLight.color.setHex(0x5eead4);
      pointLight.color.setHex(0x22d3ee);
    }

    gsap.to(scene, {
      environmentIntensity: envInt,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  function updateThemeLights(theme: "dark" | "light") {
    const isDark = theme === "dark";
    const targetDirColor = new THREE.Color(isDark ? 0x5eead4 : 0xd9006c);
    const targetPointColor = new THREE.Color(isDark ? 0x22d3ee : 0x7c3aed);
    const targetEnvInt = isDark ? 0.64 : 1.2;

    gsap.to(directionalLight.color, {
      r: targetDirColor.r,
      g: targetDirColor.g,
      b: targetDirColor.b,
      duration: 0.8,
    });
    gsap.to(pointLight.color, {
      r: targetPointColor.r,
      g: targetPointColor.g,
      b: targetPointColor.b,
      duration: 0.8,
    });
    gsap.to(scene, {
      environmentIntensity: targetEnvInt,
      duration: 0.8,
    });
  }

  return { setPointLight, turnOnLights, updateThemeLights };
};

export default setLighting;
