import * as THREE from 'three';
import { createSeededRandom } from '../seededRandom.js';
import { getDNAWithDefaults } from '../mutateDNA.js';
import { createWetBlackMaterial } from '../../materials/wetBlackMaterial.js';
import { createBranchingSkeleton } from '../core/skeleton.js';
import { createSkinnedSkeletonGeometry } from '../core/skinGeometry.js';

export function setupFamily(dna, family) {
  const effectiveDNA = getDNAWithDefaults(dna);
  const random = createSeededRandom(`${family}:${effectiveDNA.seed}:${JSON.stringify(effectiveDNA)}`);
  const material = createWetBlackMaterial(
    effectiveDNA.wetness,
    effectiveDNA.materialColor,
    effectiveDNA.materialMetalness,
  );
  return { dna: effectiveDNA, random, material };
}

export function createSculpturalBase(dna, random, material, family, options = {}) {
  const skeleton = createBranchingSkeleton(dna, random, family);
  const geometry = createSkinnedSkeletonGeometry(skeleton, random, dna, options);
  const mesh = new THREE.Mesh(geometry, material);
  const group = new THREE.Group();
  group.add(mesh);
  return { group, skeleton, mesh };
}

export function frameObject(group, dna, family) {
  const baseScale = 0.72 + dna.scale * 0.52;
  const familyScale = family === 'artifact'
    ? new THREE.Vector3(0.86 + dna.width * 0.4, 0.9 + dna.height * 0.36, 0.68 + dna.thickness * 0.36)
    : family === 'organism'
      ? new THREE.Vector3(0.82 + dna.width * 0.5, 0.78 + dna.height * 0.28, 0.78 + dna.thickness * 0.45)
      : new THREE.Vector3(0.74 + dna.width * 0.45, 0.92 + dna.height * 0.42, 0.66 + dna.thickness * 0.42);

  group.scale.multiply(familyScale.multiplyScalar(baseScale));
  group.rotation.set(
    family === 'artifact' ? 0.02 : 0.06,
    family === 'organism' ? -0.42 : -0.28,
    family === 'exoskeleton' ? -0.12 : 0.04,
  );
}
