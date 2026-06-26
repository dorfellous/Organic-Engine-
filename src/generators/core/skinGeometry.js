import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { randomBetween } from '../seededRandom.js';
import { deformGeometryOrganic } from './noise.js';

export const QUALITY = {
  preview: { lengthSegments: 34, radialSegments: 14, branchSegments: 20, detailMultiplier: 0.65 },
  high: { lengthSegments: 58, radialSegments: 24, branchSegments: 34, detailMultiplier: 1 },
  ultra: { lengthSegments: 82, radialSegments: 34, branchSegments: 48, detailMultiplier: 1.32 },
};

export function normalizeQuality(quality) {
  if (quality === 'ultra') return 'ultra';
  if (quality === 'low' || quality === 'medium' || quality === 'preview') return 'preview';
  return 'high';
}

export function getQualityProfile(dna) {
  return QUALITY[normalizeQuality(dna.quality)] || QUALITY.high;
}

function radiusAt(t, dna, options, random) {
  const profile = options.profile || 'organic';
  const base = options.baseRadius ?? 0.42;
  const mass = 0.55 + dna.thickness * 0.82 + dna.macroIntensity * 0.38;
  const middle = Math.sin(t * Math.PI);
  const taper =
    profile === 'horn'
      ? Math.max(0.05, 1 - t * 0.92)
      : profile === 'tendril'
        ? Math.max(0.04, 1 - t * 0.78)
        : 0.36 + middle * 0.82;
  const pulse =
    1 +
    Math.sin(t * Math.PI * (2.2 + dna.mesoDetail * 4.5) + (options.phase ?? 0)) *
      (0.04 + dna.chaos * 0.08 + dna.surfaceNoise * 0.05);
  const local = options.irregularity ? randomBetween(random, 0.92, 1.08) : 1;

  return Math.max(0.025, base * mass * taper * pulse * local);
}

export function createOrganicTubeAlongCurve(curve, random, dna, options = {}) {
  const quality = getQualityProfile(dna);
  const lengthSegments = options.lengthSegments ?? quality.lengthSegments;
  const radialSegments = options.radialSegments ?? quality.radialSegments;
  const frames = curve.computeFrenetFrames(lengthSegments, false);
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= lengthSegments; i += 1) {
    const t = i / lengthSegments;
    const center = curve.getPoint(t);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];
    const radius = radiusAt(t, dna, options, random);

    for (let j = 0; j < radialSegments; j += 1) {
      const v = (j / radialSegments) * Math.PI * 2;
      const wobble =
        1 +
        Math.sin(v * (2 + Math.round(dna.mesoDetail * 5)) + t * Math.PI * 5 + (options.phase ?? 0)) *
          (0.03 + dna.surfaceNoise * 0.045);
      const ringNormal = normal.clone().multiplyScalar(Math.cos(v)).add(binormal.clone().multiplyScalar(Math.sin(v))).normalize();
      const point = center.clone().add(ringNormal.clone().multiplyScalar(radius * wobble));
      vertices.push(point.x, point.y, point.z);
      normals.push(ringNormal.x, ringNormal.y, ringNormal.z);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < lengthSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * radialSegments + j;
      const b = i * radialSegments + ((j + 1) % radialSegments);
      const c = (i + 1) * radialSegments + j;
      const d = (i + 1) * radialSegments + ((j + 1) % radialSegments);
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  deformGeometryOrganic(geometry, random, dna, {
    intensity: options.deform ?? 0.09,
    scale: options.noiseScale ?? 1,
    preserveSilhouette: 0.42 + dna.smoothness * 0.25,
  });
  geometry.computeVertexNormals();
  return geometry;
}

export function createSkinnedSkeletonGeometry(skeleton, random, dna, options = {}) {
  const quality = getQualityProfile(dna);
  const geometries = [
    createOrganicTubeAlongCurve(skeleton.mainCurve, random, dna, {
      baseRadius: options.mainRadius ?? 0.52,
      lengthSegments: quality.lengthSegments,
      radialSegments: quality.radialSegments,
      profile: options.profile ?? 'organic',
      deform: options.deform ?? 0.12,
      phase: random() * Math.PI * 2,
    }),
  ];

  skeleton.branches.slice(0, options.maxBranches ?? 16).forEach((branch) => {
    geometries.push(
      createOrganicTubeAlongCurve(branch.curve, random, dna, {
        baseRadius: (options.branchRadius ?? 0.18) * (branch.role === 'major' ? 1.2 : 0.82),
        lengthSegments: quality.branchSegments,
        radialSegments: Math.max(10, Math.round(quality.radialSegments * 0.72)),
        profile: options.branchProfile ?? 'tendril',
        deform: options.branchDeform ?? 0.08,
        phase: random() * Math.PI * 2,
      }),
    );
  });

  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geometry) => geometry.dispose());
  merged.computeVertexNormals();
  return merged;
}
