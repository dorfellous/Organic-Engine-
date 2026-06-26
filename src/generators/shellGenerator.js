import * as THREE from 'three';
import { randomBetween } from './seededRandom.js';
import { addGroupedSpikes, addRidgeLines, addSecondaryGrowths } from './detailSystems.js';
import { addEdgeSpikes, deformGeometry, setupGenerator } from './generatorHelpers.js';
import { familyScale } from './geometryUtils.js';

export function generateShell(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'shell');
  const group = new THREE.Group();
  const plateCount = Math.max(5, Math.round(effectiveDNA.segments * (0.42 + effectiveDNA.detailDensity * 0.26)));
  const edgePoints = [];

  for (let index = 0; index < plateCount; index += 1) {
    const progress = plateCount <= 1 ? 0 : index / (plateCount - 1);
    const layerPulse = Math.sin(progress * Math.PI);
    const width = randomBetween(random, 1.15, 1.95) * effectiveDNA.vertebraSize * (1.16 - progress * 0.28) * (0.75 + effectiveDNA.width * 0.7);
    const height = randomBetween(random, 0.34, 0.76) * (1 + effectiveDNA.complexity * 0.5) * (0.74 + effectiveDNA.thickness * 0.7);
    const depth = randomBetween(random, 0.5, 1.05) * (1 + effectiveDNA.curve * 0.65) * (0.7 + layerPulse * 0.5 + effectiveDNA.silhouetteDrama * 0.38);
    const geometry = new THREE.SphereGeometry(width, quality.sphereW, quality.sphereH, 0, Math.PI);
    geometry.scale(1, height, depth);
    deformGeometry(geometry, random, effectiveDNA, 0.13);

    const plate = new THREE.Mesh(geometry, material);
    plate.position.set(
      (progress - 0.5) * (4.8 + effectiveDNA.width * 2.2),
      layerPulse * (0.32 + effectiveDNA.height * 0.55),
      randomBetween(random, -0.12, 0.12) * effectiveDNA.chaos,
    );
    plate.rotation.z = (progress - 0.5) * effectiveDNA.curve * 0.9;
    plate.rotation.y = Math.sin(progress * Math.PI * 1.5) * effectiveDNA.twist * 0.42;
    plate.rotation.x = -0.18;
    group.add(plate);

    edgePoints.push(
      new THREE.Vector3(plate.position.x, plate.position.y + height * 0.2, depth * 0.72),
      new THREE.Vector3(plate.position.x, plate.position.y + height * 0.2, -depth * 0.72),
    );
  }

  const ridgeMaterial = material.clone();
  ridgeMaterial.color = new THREE.Color(effectiveDNA.materialColor).multiplyScalar(0.72);

  for (let ridgeIndex = 0; ridgeIndex < 4 + Math.round(effectiveDNA.complexity * 8 * effectiveDNA.detailDensity); ridgeIndex += 1) {
    const z = randomBetween(random, -0.9, 0.9);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, 0.22, z),
      new THREE.Vector3(-0.8, 0.75 + randomBetween(random, -0.16, 0.16), z * 0.55),
      new THREE.Vector3(1.1, 0.62 + randomBetween(random, -0.16, 0.16), z * 0.35),
      new THREE.Vector3(2.7, 0.18, z),
    ]);
    const ridge = new THREE.Mesh(
      new THREE.TubeGeometry(curve, quality.path, 0.025 + effectiveDNA.complexity * 0.018, quality.radial, false),
      ridgeMaterial,
    );
    group.add(ridge);
  }

  addRidgeLines(group, random, effectiveDNA, ridgeMaterial, quality, {
    count: 3 + Math.round(effectiveDNA.detailDensity * 8),
    radius: 2.4 + effectiveDNA.width,
    length: 2.2,
  });
  addSecondaryGrowths(group, random, effectiveDNA, material, quality, edgePoints, {
    count: Math.round(edgePoints.length * effectiveDNA.detailDensity * 0.8),
  });
  addGroupedSpikes(group, random, effectiveDNA, material, quality, edgePoints, {
    density: effectiveDNA.spikeDensity * 0.35,
    lengthScale: 0.55,
  });
  addEdgeSpikes(group, random, effectiveDNA, material, quality, edgePoints, 0.55);
  group.rotation.set(0.05, -0.42, -0.08);
  familyScale(group, effectiveDNA, { width: 0.35, height: 0.18, thickness: 0.4 });
  return group;
}
