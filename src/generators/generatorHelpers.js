import * as THREE from 'three';
import { createSeededRandom, randomBetween, randomSign } from './seededRandom.js';
import { getDNAWithDefaults } from './mutateDNA.js';
import { organicDeformGeometry } from './organicNoise.js';
import { createWetBlackMaterial } from '../materials/wetBlackMaterial.js';

export const FAMILY_QUALITY = {
  low: { path: 14, radial: 10, sphereW: 24, sphereH: 16 },
  medium: { path: 22, radial: 14, sphereW: 36, sphereH: 22 },
  high: { path: 34, radial: 22, sphereW: 58, sphereH: 34 },
  ultra: { path: 46, radial: 28, sphereW: 76, sphereH: 44 },
};

export function setupGenerator(dna, family) {
  const effectiveDNA = getDNAWithDefaults(dna);
  return {
    dna: effectiveDNA,
    random: createSeededRandom(`${family}:${effectiveDNA.seed}:${JSON.stringify(effectiveDNA)}`),
    material: createWetBlackMaterial(
      effectiveDNA.wetness,
      effectiveDNA.materialColor,
      effectiveDNA.materialMetalness,
    ),
    quality: FAMILY_QUALITY[effectiveDNA.quality] || FAMILY_QUALITY.medium,
  };
}

export function deformGeometry(geometry, random, dna, amount = 0.18) {
  organicDeformGeometry(geometry, random, dna, {
    amount: amount * (0.75 + dna.detailDensity * 0.55),
    preserveSilhouette: 0.28 + dna.smoothness * 0.22,
  });
}

export function createCurvedSpike(random, dna, quality, lengthScale = 1) {
  const length = randomBetween(random, 0.28, 1.55) * dna.spikeLength * lengthScale * (0.7 + dna.silhouetteDrama * 0.55);
  const base = randomBetween(random, 0.035, 0.11) * (1 + dna.vertebraSize * 0.7);
  const bend = randomBetween(random, 0.08, 0.36) * (1 + dna.asymmetry);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(bend * randomSign(random), length * 0.45, bend * randomSign(random)),
    new THREE.Vector3(bend * 0.45 * randomSign(random), length, bend * 0.3 * randomSign(random)),
  ]);
  const geometry = new THREE.TubeGeometry(path, quality.path, base, quality.radial, false);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index);
    const taper = Math.max(0.04, 1 - y / Math.max(0.001, length));
    position.setX(index, position.getX(index) * taper);
    position.setZ(index, position.getZ(index) * taper);
  }

  deformGeometry(geometry, random, dna, 0.1);
  return new THREE.Mesh(geometry);
}

export function addEdgeSpikes(group, random, dna, material, quality, points, lengthScale = 1) {
  const count = Math.round(points.length * dna.spikeDensity * (0.25 + dna.complexity));

  for (let index = 0; index < count; index += 1) {
    const point = points[Math.floor(randomBetween(random, 0, points.length))];
    const spike = createCurvedSpike(random, dna, quality, lengthScale);
    const direction = point.clone().normalize();
    spike.material = material;
    spike.position.copy(point);
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(spike);
  }
}

export function disposeSafe(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
  });
}
