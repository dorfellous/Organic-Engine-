import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateAlienSpine } from '../generators/spineGenerator.js';

export default function Viewport({ dna }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const spineRef = useRef(null);
  const [viewportStatus, setViewportStatus] = useState('initializing');
  const [viewportError, setViewportError] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      setViewportError('Viewport mount was not found.');
      setViewportStatus('error');
      return undefined;
    }

    const getSize = () => ({
      width: Math.max(1, mount.clientWidth || 900),
      height: Math.max(1, mount.clientHeight || 600),
    });
    const initialSize = getSize();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060608);
    scene.fog = new THREE.Fog(0x060608, 12, 26);

    const camera = new THREE.PerspectiveCamera(42, initialSize.width / initialSize.height, 0.1, 100);
    camera.position.set(2.5, 3.2, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialSize.width, initialSize.height);
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

    const resize = () => {
      const { width, height } = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    let resizeObserver = null;

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
    } else {
      window.addEventListener('resize', resize);
    }

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
    setViewportStatus('viewport ready');
    setViewportError('');

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resize);
      }
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    try {
      if (spineRef.current) {
        scene.remove(spineRef.current);
        spineRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }

      const spine = generateAlienSpine(dna);
      spine.position.set(0, 0, 0);
      spine.scale.setScalar(0.9);
      spineRef.current = spine;
      scene.add(spine);
      setViewportError('');
    } catch (error) {
      setViewportError(error.message);
      setViewportStatus('error');
    }
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
      <div className="viewport-diagnostics">
        <span>Seed {dna.seed}</span>
        <span>{viewportStatus}</span>
        {viewportError && <strong>{viewportError}</strong>}
      </div>
      <div className="viewport" ref={mountRef} />
      <div className="viewport-loading">Initializing procedural viewport...</div>
    </section>
  );
}
