import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { organicDeformGeometry } from './organicNoise.js';

export function macroScale(dna, base = 1) {
  return base * (0.72 + dna.scale * 0.72);
}

export function familyScale(group, dna, weights = {}) {
  const width = weights.width ?? 1;
  const height = weights.height ?? 1;
  const thickness = weights.thickness ?? 1;
  group.scale.multiply(
    new THREE.Vector3(
      macroScale(dna, 0.84 + dna.width * 0.62 * width),
      macroScale(dna, 0.84 + dna.height * 0.62 * height),
      macroScale(dna, 0.78 + dna.thickness * 0.7 * thickness),
    ),
  );
}

export function smoothGeometry(geometry, dna) {
  geometry.computeVertexNormals();

  if (dna.smoothness > 0.65) {
    geometry.normalizeNormals();
  }
}

export function organicSphere(radius, quality, random, dna, scale = [1, 1, 1], amount = 0.16) {
  const geometry = new THREE.SphereGeometry(
    radius,
    quality.sphereW + Math.round(dna.smoothness * 18),
    quality.sphereH + Math.round(dna.smoothness * 10),
  );
  geometry.scale(scale[0], scale[1], scale[2]);
  organicDeformGeometry(geometry, random, dna, { amount });
  smoothGeometry(geometry, dna);
  return geometry;
}

export function taperedTube(path, quality, random, dna, radius, taper = 0.82, amount = 0.08) {
  const geometry = new THREE.TubeGeometry(
    path,
    quality.path + Math.round(dna.smoothness * 14),
    radius,
    quality.radial + Math.round(dna.smoothness * 8),
    false,
  );
  const position = geometry.attributes.position;
  const points = path.getPoints(quality.path + 8);
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));

  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index);
    const progress = (y - minY) / Math.max(0.001, maxY - minY);
    const shape = Math.max(0.04, 1 - progress * taper);
    position.setX(index, position.getX(index) * shape);
    position.setZ(index, position.getZ(index) * shape);
  }

  organicDeformGeometry(geometry, random, dna, { amount, preserveSilhouette: 0.2 });
  smoothGeometry(geometry, dna);
  return geometry;
}

export function irregularRingPoints(random, count, radius, y = 0, zScale = 1, jitter = 0.2) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + randomBetween(random, -jitter, jitter);
    const localRadius = radius * randomBetween(random, 1 - jitter, 1 + jitter);
    return new THREE.Vector3(
      Math.cos(angle) * localRadius,
      y + randomBetween(random, -jitter, jitter) * 0.2,
      Math.sin(angle) * localRadius * zScale,
    );
  });
}

export function randomDirection(random, yMin = -0.35, yMax = 0.8) {
  return new THREE.Vector3(
    randomBetween(random, -1, 1),
    randomBetween(random, yMin, yMax),
    randomBetween(random, -1, 1),
  ).normalize().multiplyScalar(randomSign(random) > 0 ? 1 : 0.98);
}
