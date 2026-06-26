import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { addCavities, addSecondaryGrowths } from './detailSystems.js';
import { createCurvedSpike, deformGeometry, setupGenerator } from './generatorHelpers.js';
import { familyScale } from './geometryUtils.js';

export function generatePod(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'pod');
  const group = new THREE.Group();
  const podGeometry = new THREE.SphereGeometry(
    1.35 + effectiveDNA.vertebraSize * 0.75,
    quality.sphereW + 10,
    quality.sphereH + 8,
  );
  podGeometry.scale(
    0.7 + effectiveDNA.width * 0.65 + effectiveDNA.asymmetry * 0.12,
    1.28 + effectiveDNA.height * 0.92 + effectiveDNA.curve * 0.28,
    0.62 + effectiveDNA.thickness * 0.68,
  );
  deformGeometry(podGeometry, random, effectiveDNA, 0.14 + effectiveDNA.chaos * 0.12);

  const pod = new THREE.Mesh(podGeometry, material);
  pod.rotation.z = randomBetween(random, -0.16, 0.16);
  group.add(pod);

  const grooveMaterial = material.clone();
  grooveMaterial.color = new THREE.Color(effectiveDNA.materialColor).multiplyScalar(0.55);
  const anchors = [];
  const grooveCount = 5 + Math.round(effectiveDNA.detailDensity * 12);
  for (let index = 0; index < grooveCount; index += 1) {
    const angle = (index / grooveCount) * Math.PI * 2 + randomBetween(random, -0.12, 0.12);
    const x = Math.cos(angle) * 0.9;
    const z = Math.sin(angle) * 0.58;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * 0.25, -1.95, z * 0.25),
      new THREE.Vector3(x, -0.7, z),
      new THREE.Vector3(x * randomBetween(random, 0.75, 1.15), 0.55, z * randomBetween(random, 0.75, 1.15)),
      new THREE.Vector3(x * 0.2, 2.0, z * 0.2),
    ]);
    const groove = new THREE.Mesh(
      new THREE.TubeGeometry(curve, quality.path + 6, 0.026 + effectiveDNA.complexity * 0.016, quality.radial, false),
      grooveMaterial,
    );
    group.add(groove);
    anchors.push(curve.getPoint(randomBetween(random, 0.18, 0.82)));
  }

  const openingGeometry = new THREE.TorusGeometry(0.34 + effectiveDNA.asymmetry * 0.12, 0.04, quality.radial, quality.radial + 10);
  const opening = new THREE.Mesh(openingGeometry, grooveMaterial);
  opening.position.set(randomBetween(random, -0.35, 0.35), 0.7 + effectiveDNA.curve * 0.45, 0.72);
  opening.rotation.set(Math.PI / 2 + randomBetween(random, -0.25, 0.25), 0, randomBetween(random, -0.4, 0.4));
  opening.scale.x = randomBetween(random, 0.7, 1.25);
  group.add(opening);

  addCavities(group, random, effectiveDNA, grooveMaterial, {
    count: 1 + Math.round(effectiveDNA.openingAmount * 6),
    radius: 1.2,
  });
  addSecondaryGrowths(group, random, effectiveDNA, material, quality, anchors, {
    count: Math.round(anchors.length * effectiveDNA.detailDensity * 0.85),
  });

  const spikeCount = Math.round(effectiveDNA.spikeDensity * effectiveDNA.detailDensity * (3 + effectiveDNA.complexity * 6));
  for (let index = 0; index < spikeCount; index += 1) {
    const spike = createCurvedSpike(random, effectiveDNA, quality, 0.75);
    const direction = new THREE.Vector3(randomBetween(random, -0.7, 0.7), randomSign(random) * randomBetween(random, 0.35, 1), randomBetween(random, -0.7, 0.7)).normalize();
    spike.material = material;
    spike.position.copy(direction.clone().multiply(new THREE.Vector3(0.85, 1.55, 0.74)));
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(spike);
  }

  group.rotation.set(0.04, -0.28, 0.08);
  familyScale(group, effectiveDNA, { width: 0.18, height: 0.35, thickness: 0.28 });
  return group;
}
