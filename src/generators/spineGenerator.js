import * as THREE from 'three';
import { createSeededRandom, randomBetween, randomSign } from './seededRandom.js';
import { getDNAWithDefaults } from './mutateDNA.js';
import { addGroupedSpikes, addSecondaryGrowths } from './detailSystems.js';
import { familyScale } from './geometryUtils.js';
import { organicDeformGeometry } from './organicNoise.js';
import { createWetBlackMaterial } from '../materials/wetBlackMaterial.js';

const QUALITY_SETTINGS = {
  low: {
    sphereWidth: 22,
    sphereHeight: 14,
    spikePath: 10,
    spikeRadial: 9,
    ribPath: 10,
    ribRadial: 8,
  },
  medium: {
    sphereWidth: 34,
    sphereHeight: 20,
    spikePath: 16,
    spikeRadial: 12,
    ribPath: 16,
    ribRadial: 10,
  },
  high: {
    sphereWidth: 58,
    sphereHeight: 34,
    spikePath: 30,
    spikeRadial: 20,
    ribPath: 30,
    ribRadial: 16,
  },
  ultra: {
    sphereWidth: 76,
    sphereHeight: 44,
    spikePath: 44,
    spikeRadial: 28,
    ribPath: 42,
    ribRadial: 24,
  },
};

function getQualitySettings(quality) {
  return QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.medium;
}

function makePathPoint(index, count, dna, random) {
  const progress = count <= 1 ? 0 : index / (count - 1);
  const centered = progress - 0.5;
  const length = (7.4 + dna.segments * 0.08) * (0.75 + dna.height * 0.7);
  const wave = Math.sin(progress * Math.PI * 1.4 + randomBetween(random, -0.35, 0.35));
  const curl = Math.sin(progress * Math.PI * 2.6 + dna.twist * 3.2);

  return new THREE.Vector3(
    centered * length,
    wave * dna.curve * (1.2 + dna.silhouetteDrama) + curl * dna.asymmetry * 0.34,
    Math.sin(progress * Math.PI * 2.1) * dna.curve * (0.85 + dna.width) + centered * dna.asymmetry * (0.45 + dna.chaos),
  );
}

function deformGeometry(geometry, random, dna, segmentIndex) {
  organicDeformGeometry(geometry, random, dna, {
    amount: 0.2 + segmentIndex * 0.002 + dna.detailDensity * 0.12,
    preserveSilhouette: 0.22 + dna.smoothness * 0.28,
    seed: segmentIndex + random(),
  });
}

function createVertebra(random, dna, index, total, quality) {
  const radius = dna.vertebraSize * randomBetween(random, 0.58, 1.34) * (0.78 + dna.thickness * 0.64);
  const depth = randomBetween(random, 0.46, 1.2) * (1 + dna.complexity * 0.35);
  const geometry = new THREE.SphereGeometry(
    radius,
    quality.sphereWidth + Math.round(dna.complexity * 8),
    quality.sphereHeight,
  );

  geometry.scale(
    randomBetween(random, 0.48, 1.35) * (1 + dna.asymmetry * 0.32) * (0.7 + dna.width * 0.75),
    depth,
    randomBetween(random, 0.34, 1.08) * (0.74 + dna.thickness * 0.65),
  );
  deformGeometry(geometry, random, dna, index);

  const mesh = new THREE.Mesh(geometry);
  const taper = Math.sin((index / Math.max(1, total - 1)) * Math.PI);
  mesh.scale.multiplyScalar(0.58 + taper * 0.58);
  return mesh;
}

function createSpike(random, dna, segmentRadius, quality) {
  const length = randomBetween(random, 0.35, 1.8) * dna.spikeLength * (0.75 + dna.complexity);
  const base = randomBetween(random, 0.04, 0.12) * (1 + dna.vertebraSize);
  const curve = randomBetween(random, 0.06, 0.34) * (1 + dna.organicDistortion);
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(curve * randomSign(random), length * 0.38, curve * randomSign(random)),
    new THREE.Vector3(curve * randomSign(random) * 0.6, length, curve * randomSign(random) * 0.6),
  ];
  const path = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(path, quality.spikePath, base, quality.spikeRadial, false);

  for (let index = 0; index < geometry.attributes.position.count; index += 1) {
    const y = geometry.attributes.position.getY(index);
    const taper = Math.max(0.08, 1 - y / Math.max(0.001, length));
    geometry.attributes.position.setX(index, geometry.attributes.position.getX(index) * taper);
    geometry.attributes.position.setZ(index, geometry.attributes.position.getZ(index) * taper);
  }

  deformGeometry(geometry, random, { ...dna, organicDistortion: dna.organicDistortion * 0.65 }, 0);

  const mesh = new THREE.Mesh(geometry);
  const azimuth = randomBetween(random, 0, Math.PI * 2);
  const elevation = randomBetween(random, -0.25, 0.55);
  const direction = new THREE.Vector3(
    Math.cos(azimuth),
    elevation,
    Math.sin(azimuth),
  ).normalize();

  mesh.position.copy(direction.clone().multiplyScalar(segmentRadius * randomBetween(random, 0.55, 0.92)));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  return mesh;
}

export function generateAlienSpine(dna) {
  const effectiveDNA = getDNAWithDefaults(dna);
  const random = createSeededRandom(`${effectiveDNA.seed}:${JSON.stringify(effectiveDNA)}`);
  const group = new THREE.Group();
  const quality = getQualitySettings(effectiveDNA.quality);
  const detailQuality = {
    path: quality.spikePath,
    radial: quality.spikeRadial,
    sphereW: quality.sphereWidth,
    sphereH: quality.sphereHeight,
  };
  const material = createWetBlackMaterial(
    effectiveDNA.wetness,
    effectiveDNA.materialColor,
    effectiveDNA.materialMetalness,
  );
  const points = Array.from({ length: effectiveDNA.segments }, (_, index) =>
    makePathPoint(index, effectiveDNA.segments, effectiveDNA, random),
  );

  points.forEach((point, index) => {
    const vertebra = createVertebra(random, effectiveDNA, index, effectiveDNA.segments, quality);
    const next = points[Math.min(index + 1, points.length - 1)];
    const previous = points[Math.max(index - 1, 0)];
    const tangent = next.clone().sub(previous).normalize();
    const twistAngle = index * effectiveDNA.twist * 0.75 + randomBetween(random, -0.45, 0.45);
    const segmentRadius = effectiveDNA.vertebraSize * randomBetween(random, 0.85, 1.35);

    vertebra.material = material;
    vertebra.position.copy(point);
    vertebra.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
    vertebra.rotateX(twistAngle);
    vertebra.rotateY(randomBetween(random, -effectiveDNA.asymmetry, effectiveDNA.asymmetry) * 0.75);
    vertebra.rotateZ(randomBetween(random, -effectiveDNA.asymmetry, effectiveDNA.asymmetry) * 0.55);

    const spikeCount = Math.round(
      effectiveDNA.spikeDensity *
      effectiveDNA.detailDensity *
      randomBetween(random, 0, 3 + effectiveDNA.complexity * 6),
    );
    for (let spikeIndex = 0; spikeIndex < spikeCount; spikeIndex += 1) {
      const spike = createSpike(random, effectiveDNA, segmentRadius, quality);
      spike.material = material;
      vertebra.add(spike);
    }

    group.add(vertebra);
  });

  addSecondaryGrowths(group, random, effectiveDNA, material, detailQuality, points, {
    count: Math.round(effectiveDNA.segments * effectiveDNA.detailDensity * 0.75),
  });
  addGroupedSpikes(group, random, effectiveDNA, material, detailQuality, points, {
    density: effectiveDNA.spikeDensity * 0.55,
    lengthScale: 0.55,
  });

  const ribMaterial = material.clone();
  ribMaterial.color = new THREE.Color(effectiveDNA.materialColor).multiplyScalar(0.75);

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const curve = new THREE.CatmullRomCurve3([
      start,
      start.clone().lerp(end, 0.42).add(new THREE.Vector3(0, randomBetween(random, -0.35, 0.35), randomBetween(random, -0.35, 0.35))),
      end,
    ]);
    const tube = new THREE.TubeGeometry(
      curve,
      quality.ribPath,
      0.055 + effectiveDNA.complexity * 0.035,
      quality.ribRadial,
      false,
    );
    const mesh = new THREE.Mesh(tube, ribMaterial);
    group.add(mesh);
  }

  group.rotation.z = randomBetween(random, -0.18, 0.18);
  group.rotation.y = -0.25;
  familyScale(group, effectiveDNA, { width: 0.25, height: 0.2, thickness: 0.2 });
  return group;
}
