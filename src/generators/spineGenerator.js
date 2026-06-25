import * as THREE from 'three';
import { createSeededRandom, randomBetween, randomSign } from './seededRandom.js';
import { getDNAWithDefaults } from './mutateDNA.js';
import { createWetBlackMaterial } from '../materials/wetBlackMaterial.js';

const QUALITY_SETTINGS = {
  low: { sphereWidth: 22, sphereHeight: 14, spikePath: 10, spikeRadial: 9, ribPath: 10, ribRadial: 8 },
  medium: { sphereWidth: 34, sphereHeight: 20, spikePath: 16, spikeRadial: 12, ribPath: 16, ribRadial: 10 },
  high: { sphereWidth: 44, sphereHeight: 26, spikePath: 22, spikeRadial: 16, ribPath: 22, ribRadial: 12 },
};

function getQualitySettings(quality) { return QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.medium; }

function makePathPoint(index, count, dna, random) {
  const progress = count <= 1 ? 0 : index / (count - 1);
  const centered = progress - 0.5;
  const length = 8.2 + dna.segments * 0.08;
  const wave = Math.sin(progress * Math.PI * 1.4 + randomBetween(random, -0.35, 0.35));
  const curl = Math.sin(progress * Math.PI * 2.6 + dna.twist * 3.2);
  return new THREE.Vector3(centered * length, wave * dna.curve * 1.7 + curl * dna.asymmetry * 0.34, Math.sin(progress * Math.PI * 2.1) * dna.curve * 1.15 + centered * dna.asymmetry * 0.75);
}

function deformGeometry(geometry, random, dna, segmentIndex) {
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const distortion = dna.organicDistortion * 0.34;
  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    const radial = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    const pulse = Math.sin(vertex.y * 3.7 + segmentIndex * 0.61) * 0.08 + Math.cos(radial * 5.4 + segmentIndex) * 0.05;
    const randomPush = randomBetween(random, -distortion, distortion);
    vertex.x += vertex.x * (pulse + randomPush * 0.45);
    vertex.y += randomBetween(random, -distortion, distortion) * 0.22;
    vertex.z += vertex.z * (-pulse + randomPush * 0.45);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

function createVertebra(random, dna, index, total, quality) {
  const radius = dna.vertebraSize * randomBetween(random, 0.72, 1.22);
  const depth = randomBetween(random, 0.58, 1.08) * (1 + dna.complexity * 0.3);
  const geometry = new THREE.SphereGeometry(radius, quality.sphereWidth + Math.round(dna.complexity * 8), quality.sphereHeight);
  geometry.scale(randomBetween(random, 0.58, 1.2) * (1 + dna.asymmetry * 0.32), depth, randomBetween(random, 0.42, 0.96));
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
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(curve * randomSign(random), length * 0.38, curve * randomSign(random)), new THREE.Vector3(curve * randomSign(random) * 0.6, length, curve * randomSign(random) * 0.6)];
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
  const direction = new THREE.Vector3(Math.cos(azimuth), elevation, Math.sin(azimuth)).normalize();
  mesh.position.copy(direction.clone().multiplyScalar(segmentRadius * randomBetween(random, 0.55, 0.92)));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  return mesh;
}

export function generateAlienSpine(dna) {
  const effectiveDNA = getDNAWithDefaults(dna);
  const random = createSeededRandom(`${effectiveDNA.seed}:${JSON.stringify(effectiveDNA)}`);
  const group = new THREE.Group();
  const quality = getQualitySettings(effectiveDNA.quality);
  const material = createWetBlackMaterial(effectiveDNA.wetness, effectiveDNA.materialColor, effectiveDNA.materialMetalness);
  const points = Array.from({ length: effectiveDNA.segments }, (_, index) => makePathPoint(index, effectiveDNA.segments, effectiveDNA, random));

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
    const spikeCount = Math.round(effectiveDNA.spikeDensity * randomBetween(random, 1, 5 + effectiveDNA.complexity * 7));
    for (let spikeIndex = 0; spikeIndex < spikeCount; spikeIndex += 1) {
      const spike = createSpike(random, effectiveDNA, segmentRadius, quality);
      spike.material = material;
      vertebra.add(spike);
    }
    group.add(vertebra);
  });

  const ribMaterial = material.clone();
  ribMaterial.color = new THREE.Color(effectiveDNA.materialColor).multiplyScalar(0.75);
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const curve = new THREE.CatmullRomCurve3([start, start.clone().lerp(end, 0.42).add(new THREE.Vector3(0, randomBetween(random, -0.35, 0.35), randomBetween(random, -0.35, 0.35))), end]);
    const tube = new THREE.TubeGeometry(curve, quality.ribPath, 0.055 + effectiveDNA.complexity * 0.035, quality.ribRadial, false);
    group.add(new THREE.Mesh(tube, ribMaterial));
  }
  group.rotation.z = randomBetween(random, -0.18, 0.18);
  group.rotation.y = -0.25;
  return group;
}
