import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc?v=2",
          "MyCharacter12"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;

                // Change clothing colors to match site theme
                if (mesh.material) {
                  if (mesh.name === "BODY.SHIRT") { // The shirt mesh
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#8B4513");
                    mesh.material = newMat;
                  } else if (mesh.name === "Pant") {
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });

            // Add long hair to character
            const headBone = character.getObjectByName('spine006'); console.log('headBone found:', headBone);
            if (headBone) {
              const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ff0000'), roughness: 0.8 });
              
              // Top hair cap
              const capGeo = new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
              const cap = new THREE.Mesh(capGeo, hairMat);
              cap.position.set(0, 0.08, 0);
              headBone.add(cap);

              // Long back hair
              const backGeo = new THREE.CylinderGeometry(0.18, 0.10, 0.9, 8);
              const back = new THREE.Mesh(backGeo, hairMat);
              back.position.set(0, -0.35, -0.12);
              headBone.add(back);

              // Left side hair
              const sideGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.7, 6);
              const leftHair = new THREE.Mesh(sideGeo, hairMat);
              leftHair.position.set(-0.16, -0.28, 0);
              leftHair.rotation.z = 0.15;
              headBone.add(leftHair);

              // Right side hair
              const rightHair = new THREE.Mesh(sideGeo, hairMat);
              rightHair.position.set(0.16, -0.28, 0);
              rightHair.rotation.z = -0.15;
              headBone.add(rightHair);
            }
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;

            // Monitor scale is handled by GsapScroll.ts animations

            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
