import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { addEdgeSpikes, deformGeometry, setupGenerator } from './generatorHelpers.js';

export function generateMask(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'mask');
  const group = new THREE.Group();
  const panelCount = 4 + Math.round(effectiveDNA.complexity * 5);
  const edgePoints = [];

  for (let index = 0; index < panelCount; index += 1) {
    const progress = panelCount <= 1 ? 0 : index / (panelCount - 1);
    const side = index % 2 === 0 ? -1 : 1;
    const y = 1.55 - progress * 3.25;
    const geometry = new THREE.SphereGeometry(
      randomBetween(random, 0.46, 0.82) * effectiveDNA.vertebraSize,
      quality.sphereW,
      quality.sphereH,
    );
    geometry.scale(
      randomBetween(random, 0.55, 0.95),
      randomBetween(random, 0.5, 1.0),
      randomBetween(random, 0.1, 0.22),
    );
    deformGeometry(geometry, random, effectiveDNA, 0.14);

    const panel = new THREE.Mesh(geometry, material);
    panel.position.set(side * randomBetween(random, 0.24, 0.55) * (1 - progress * 0.32), y, 0);
    panel.rotation.set(randomBetween(random, -0.24, 0.24), side * 0.22, side * randomBetween(random, 0.08, 0.32));
    group.add(panel);
    edgePoints.push(new THREE.Vector3(panel.position.x + side * 0.42, y, 0.1));
  }

  const bridgeGeometry = new THREE.SphereGeometry(0.72 + effectiveDNA.vertebraSize * 0.45, quality.sphereW, quality.sphereH);
  bridgeGeometry.scale(0.55, 1.75, 0.16);
  deformGeometry(bridgeGeometry, random, effectiveDNA, 0.16);
  const bridge = new THREE.Mesh(bridgeGeometry, material);
  bridge.position.z = -0.06;
  group.add(bridge);

  const cavityMaterial = new THREE.MeshBasicMaterial({ color: 0x010102 });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(
      new THREE.TorusGeometry(0.28 + effectiveDNA.asymmetry * 0.1, 0.045, quality.radial, quality.radial + 14),
      material,
    );
    eye.position.set(side * 0.42, 0.66 + randomBetween(random, -0.08, 0.08), 0.18);
    eye.rotation.set(0.1, side * 0.2, side * randomBetween(random, -0.35, 0.35));
    eye.scale.x = randomBetween(random, 0.78, 1.28);
    eye.scale.y = randomBetween(random, 0.58, 0.92);
    group.add(eye);

    const voidMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, quality.radial + 4, quality.radial),
      cavityMaterial,
    );
    voidMesh.scale.set(1.45, 0.78, 0.18);
    voidMesh.position.copy(eye.position).add(new THREE.Vector3(0, 0, 0.015));
    group.add(voidMesh);
  });

  const ridgeCount = 4 + Math.round(effectiveDNA.complexity * 6);
  for (let index = 0; index < ridgeCount; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const y = randomBetween(random, -1.15, 1.2);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, y + 0.35, 0.2),
      new THREE.Vector3(side * randomBetween(random, 0.38, 0.72), y, 0.24),
      new THREE.Vector3(side * randomBetween(random, 0.45, 0.9), y - 0.42, 0.12),
    ]);
    const ridge = new THREE.Mesh(
      new THREE.TubeGeometry(curve, quality.path, 0.025 + effectiveDNA.complexity * 0.012, quality.radial, false),
      material,
    );
    group.add(ridge);
  }

  addEdgeSpikes(group, random, effectiveDNA, material, quality, edgePoints, 0.65);
  group.rotation.set(0.04, -0.28, randomSign(random) * 0.04);
  return group;
}
