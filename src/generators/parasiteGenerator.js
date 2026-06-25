import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { deformGeometry, setupGenerator } from './generatorHelpers.js';

export function generateParasite(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'parasite');
  const group = new THREE.Group();
  const bodyGeometry = new THREE.SphereGeometry(
    1.2 + effectiveDNA.vertebraSize * 0.8,
    quality.sphereW,
    quality.sphereH,
  );
  bodyGeometry.scale(1.18, 0.82 + effectiveDNA.complexity * 0.28, 0.72);
  deformGeometry(bodyGeometry, random, effectiveDNA, 0.28);

  const body = new THREE.Mesh(bodyGeometry, material);
  body.rotation.set(0.24, -0.22, 0.18);
  group.add(body);

  const tendrilCount = 5 + Math.round(effectiveDNA.segments * 0.28 + effectiveDNA.complexity * 8);
  for (let index = 0; index < tendrilCount; index += 1) {
    const angle = (index / tendrilCount) * Math.PI * 2 + randomBetween(random, -0.25, 0.25);
    const side = new THREE.Vector3(Math.cos(angle), randomBetween(random, -0.2, 0.35), Math.sin(angle));
    const length = randomBetween(random, 1.1, 3.2) * (0.6 + effectiveDNA.spikeLength);
    const path = new THREE.CatmullRomCurve3([
      side.clone().multiplyScalar(0.85),
      side.clone().multiplyScalar(1.35).add(new THREE.Vector3(0, randomBetween(random, -0.7, 0.8), 0)),
      side.clone().multiplyScalar(length).add(new THREE.Vector3(randomBetween(random, -0.6, 0.6), randomBetween(random, -1.0, 0.7), randomBetween(random, -0.6, 0.6))),
    ]);
    const radius = randomBetween(random, 0.045, 0.12) * (1 + effectiveDNA.vertebraSize * 0.55);
    const tendril = new THREE.Mesh(
      new THREE.TubeGeometry(path, quality.path, radius, quality.radial, false),
      material,
    );
    deformGeometry(tendril.geometry, random, effectiveDNA, 0.08);
    group.add(tendril);

    const bumpCount = 2 + Math.round(effectiveDNA.complexity * 4);
    for (let bumpIndex = 0; bumpIndex < bumpCount; bumpIndex += 1) {
      const point = path.getPoint(randomBetween(random, 0.18, 0.88));
      const bumpGeometry = new THREE.SphereGeometry(randomBetween(random, 0.08, 0.18), quality.radial + 4, quality.radial);
      bumpGeometry.scale(1.1, 0.45, 1);
      const bump = new THREE.Mesh(bumpGeometry, material);
      bump.position.copy(point);
      bump.rotation.set(randomBetween(random, -1, 1), randomBetween(random, -1, 1), randomSign(random) * 0.7);
      group.add(bump);
    }
  }

  const nodeCount = 8 + Math.round(effectiveDNA.complexity * 12);
  for (let index = 0; index < nodeCount; index += 1) {
    const direction = new THREE.Vector3(
      randomBetween(random, -1, 1),
      randomBetween(random, -0.55, 0.75),
      randomBetween(random, -1, 1),
    ).normalize();
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(randomBetween(random, 0.08, 0.22), quality.radial + 4, quality.radial),
      material,
    );
    node.position.copy(direction.multiplyScalar(randomBetween(random, 0.72, 1.45)));
    node.scale.y = randomBetween(random, 0.55, 1.1);
    group.add(node);
  }

  group.rotation.y = -0.35;
  return group;
}
