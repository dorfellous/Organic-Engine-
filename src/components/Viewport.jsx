import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateAlienSpine } from '../generators/spineGenerator.js';

export default function Viewport({ dna }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const spineRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.Fog(0x060608, 12, 26);

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(2.5, 3.2, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 18;

    const keyLight = new THREE.DirectionalLight(0xffffff, 5.8);
    keyLight.position.set(-3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8cb7ff, 4.4);
    rimLight.position.set(4, 2, -5);
    scene.add(rimLight);

    const lowLight = new THREE.PointLight(0xd6f5ff, 1.8, 18);
    lowLight.position.set(0, -3.5, 4);
    scene.add(lowLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.82, metalness: 0.1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    scene.add(floor);

    sceneRef.current = scene;

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);

    let frameId = 0;
    const animate = () => {
      controls.update();
      if (spineRef.current) {
        spineRef.current.rotation.y += 0.0015;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    if (spineRef.current) {
      scene.remove(spineRef.current);
      spineRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    const spine = generateAlienSpine(dna);
    spineRef.current = spine;
    scene.add(spine);
  }, [dna]);

  return (
    <section className="viewport-shell">
      <div className="viewport-header">
        <div>
          <p>Organic Engine</p>
          <h1>Procedural alien spine generator</h1>
        </div>
        <span>Code generated geometry</span>
      </div>
      <div className="viewport" ref={mountRef} />
    </section>
  );
}
