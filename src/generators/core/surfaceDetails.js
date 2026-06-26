import * as THREE from 'three';
import { randomBetween, randomSign } from '../seededRandom.js';
import { createOrganicTubeAlongCurve, getQualityProfile } from './skinGeometry.js';

function sampleCurveAnchors(curve, count, random, inset = 0.08) {
  return Array.from({ length: count }, () => curve.getPoint(randomBetween(random, inset, 1 - inset)));
}

export function createCurvedSpike(random, dna, material, options = {}) {
  const quality = getQualityProfile(dna);
  const length = options.length ?? randomBetween(random, 0.45, 1.75) * (0.45 + dna.spikeLength + dna.silhouetteDrama * 0.35);
  const bend = randomBetween(random, 0.12, 0.58) * (0.7 + dna.chaos);
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(bend * randomSign(random), length * 0.38, bend * randomSign(random)),
    new THREE.Vector3(bend * 0.55 * randomSign(random), length * 0.74, bend * 0.35 * randomSign(random)),
    new THREE.Vector3(bend * 0.15 * randomSign(random), length, bend * 0.16 * randomSign(random)),
  ];
  const geometry = createOrganicTubeAlongCurve(new THREE.CatmullRomCurve3(points), random, dna, {
    baseRadius: options.baseRadius ?? randomBetween(random, 0.045, 0.11) * (0.7 + dna.thickness),
    lengthSegments: quality.branchSegments,
    radialSegments: Math.max(10, Math.round(quality.radialSegments * 0.62)),
    profile: 'horn',
    deform: 0.05,
  });
  return new THREE.Mesh(geometry, material);
}

export function addRidgesAlongSurface(group, skeleton, random, dna, material, options = {}) {
  const quality = getQualityProfile(dna);
  const ridgeCount = options.count ?? Math.round((4 + dna.mesoDetail * 13) * quality.detailMultiplier);
  const anchors = sampleCurveAnchors(skeleton.mainCurve, ridgeCount, random, 0.1);

  anchors.forEach((anchor, index) => {
    const tangent = skeleton.mainCurve.getTangent(randomBetween(random, 0.12, 0.9));
    const side = new THREE.Vector3(randomSign(random), randomBetween(random, -0.28, 0.28), randomBetween(random, -1, 1)).normalize();
    const length = randomBetween(random, 0.55, 1.7) * (0.55 + dna.silhouetteDrama);
    const points = [
      anchor.clone().add(side.clone().multiplyScalar(-length * 0.5)),
      anchor.clone().add(tangent.clone().multiplyScalar(randomBetween(random, -0.16, 0.16))),
      anchor.clone().add(side.clone().multiplyScalar(length * 0.5)),
    ];
    const ridge = new THREE.Mesh(
      createOrganicTubeAlongCurve(new THREE.CatmullRomCurve3(points), random, dna, {
        baseRadius: randomBetween(random, 0.018, 0.045) * (0.7 + dna.mesoDetail),
        lengthSegments: Math.max(12, Math.round(quality.branchSegments * 0.6)),
        radialSegments: Math.max(8, Math.round(quality.radialSegments * 0.45)),
        profile: 'ridge',
        deform: 0.035,
        phase: index,
      }),
      material,
    );
    group.add(ridge);
  });
}

export function addCavitiesOrOpenings(group, skeleton, random, dna, material, options = {}) {
  const count = options.count ?? Math.round(dna.openingAmount * (2 + dna.mesoDetail * 7));
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x010102,
    roughness: 0.72,
    metalness: 0.05,
  });
  const rimMaterial = material.clone();
  rimMaterial.roughness = Math.min(0.65, rimMaterial.roughness + 0.18);

  sampleCurveAnchors(skeleton.mainCurve, count, random, 0.16).forEach((anchor) => {
    const size = randomBetween(random, 0.16, 0.42) * (0.7 + dna.openingAmount);
    const normal = new THREE.Vector3(randomBetween(random, -0.8, 0.8), randomBetween(random, -0.15, 0.45), 1).normalize();
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(size, size * randomBetween(random, 0.08, 0.16), 18, 44),
      rimMaterial,
    );
    rim.position.copy(anchor).add(normal.clone().multiplyScalar(0.22 + dna.thickness * 0.18));
    rim.lookAt(rim.position.clone().add(normal));
    rim.scale.set(randomBetween(random, 0.75, 1.45), randomBetween(random, 0.46, 1.0), 1);
    group.add(rim);

    const recess = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.95, 28, 16),
      darkMaterial,
    );
    recess.position.copy(rim.position).add(normal.clone().multiplyScalar(-size * 0.16));
    recess.scale.set(rim.scale.x * 0.9, rim.scale.y * 0.58, 0.22);
    recess.lookAt(recess.position.clone().add(normal));
    group.add(recess);
  });
}

export function addLayeredPlates(group, skeleton, random, dna, material, options = {}) {
  const quality = getQualityProfile(dna);
  const count = options.count ?? Math.round((4 + dna.mesoDetail * 10) * quality.detailMultiplier);
  const plateMaterial = material.clone();
  plateMaterial.roughness = Math.min(0.72, plateMaterial.roughness + 0.08);

  sampleCurveAnchors(skeleton.mainCurve, count, random, 0.08).forEach((anchor, index) => {
    const geometry = new THREE.SphereGeometry(
      randomBetween(random, 0.24, 0.58) * (0.7 + dna.thickness),
      Math.max(24, quality.radialSegments + 8),
      Math.max(14, Math.round(quality.radialSegments * 0.7)),
    );
    geometry.scale(
      randomBetween(random, 0.85, 1.85) * (0.65 + dna.width),
      randomBetween(random, 0.12, 0.3) * (0.6 + dna.thickness),
      randomBetween(random, 0.42, 0.95),
    );
    geometry.computeVertexNormals();

    const plate = new THREE.Mesh(geometry, plateMaterial);
    const side = new THREE.Vector3(randomSign(random), randomBetween(random, -0.25, 0.35), randomBetween(random, -0.8, 0.8)).normalize();
    plate.position.copy(anchor).add(side.clone().multiplyScalar(randomBetween(random, 0.22, 0.48)));
    plate.rotation.set(randomBetween(random, -0.45, 0.45), randomBetween(random, -0.7, 0.7), index * 0.2);
    group.add(plate);
  });
}

export function addPoresAndDents(group, skeleton, random, dna, material, options = {}) {
  const quality = getQualityProfile(dna);
  const count = Math.min(48, options.count ?? Math.round((4 + dna.microDetail * 28) * quality.detailMultiplier));
  const poreMaterial = new THREE.MeshStandardMaterial({
    color: 0x020203,
    roughness: 0.85,
    metalness: 0.02,
  });

  sampleCurveAnchors(skeleton.mainCurve, count, random, 0.08).forEach((anchor) => {
    const pore = new THREE.Mesh(
      new THREE.SphereGeometry(randomBetween(random, 0.025, 0.08), 12, 8),
      poreMaterial,
    );
    const offset = new THREE.Vector3(randomBetween(random, -0.6, 0.6), randomBetween(random, -0.2, 0.4), randomBetween(random, -0.6, 0.6)).normalize();
    pore.position.copy(anchor).add(offset.multiplyScalar(randomBetween(random, 0.28, 0.62)));
    pore.scale.set(randomBetween(random, 0.8, 1.5), randomBetween(random, 0.42, 0.85), 0.18);
    pore.rotation.set(randomBetween(random, -1, 1), randomBetween(random, -1, 1), randomBetween(random, -1, 1));
    group.add(pore);
  });
}

export function addCurvedSpikes(group, skeleton, random, dna, material, options = {}) {
  const count = options.count ?? Math.round(dna.spikeDensity * (3 + dna.mesoDetail * 10));
  const anchors = skeleton.branches.length > 0
    ? skeleton.branches.map((branch) => branch.curve.getPoint(randomBetween(random, 0.45, 0.94)))
    : sampleCurveAnchors(skeleton.mainCurve, count, random, 0.12);

  anchors.slice(0, count).forEach((anchor) => {
    const spike = createCurvedSpike(random, dna, material, {
      length: randomBetween(random, 0.35, 1.7) * (0.55 + dna.spikeLength),
    });
    const direction = anchor.clone().normalize().add(new THREE.Vector3(randomBetween(random, -0.35, 0.35), randomBetween(random, 0.1, 0.6), randomBetween(random, -0.35, 0.35))).normalize();
    spike.position.copy(anchor);
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(spike);
  });
}
