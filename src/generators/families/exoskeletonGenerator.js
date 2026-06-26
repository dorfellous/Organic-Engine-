import * as THREE from 'three';
import { addCurvedSpikes, addLayeredPlates, addPoresAndDents, addRidgesAlongSurface } from '../core/surfaceDetails.js';
import { createOrganicTubeAlongCurve, getQualityProfile } from '../core/skinGeometry.js';
import { createSculpturalBase, frameObject, setupFamily } from './familyHelpers.js';

export function generateExoskeletonBone(dna) {
  const { dna: effectiveDNA, random, material } = setupFamily(dna, 'exoskeleton');
  const hardDNA = {
    ...effectiveDNA,
    wetness: Math.min(effectiveDNA.wetness, effectiveDNA.materialColor === '#050505' ? 0.82 : 0.58),
    branching: Math.max(effectiveDNA.branching, 0.35),
    mesoDetail: Math.max(effectiveDNA.mesoDetail, 0.58),
    microDetail: effectiveDNA.microDetail * 0.72,
    surfaceNoise: effectiveDNA.surfaceNoise * 0.65,
  };
  const quality = getQualityProfile(hardDNA);
  const { group, skeleton } = createSculpturalBase(hardDNA, random, material, 'exoskeleton', {
    mainRadius: 0.38 + hardDNA.thickness * 0.22,
    branchRadius: 0.13 + hardDNA.thickness * 0.06,
    maxBranches: 13,
    profile: 'horn',
    branchProfile: 'horn',
    deform: 0.08 + hardDNA.chaos * 0.05,
    branchDeform: 0.06,
  });

  skeleton.branches.slice(0, 4 + Math.round(hardDNA.branching * 7)).forEach((branch) => {
    const horn = new THREE.Mesh(
      createOrganicTubeAlongCurve(branch.curve, random, hardDNA, {
        baseRadius: 0.16 + hardDNA.thickness * 0.08,
        lengthSegments: quality.branchSegments,
        radialSegments: Math.max(12, Math.round(quality.radialSegments * 0.62)),
        profile: 'horn',
        deform: 0.055,
      }),
      material,
    );
    horn.scale.multiplyScalar(1.12 + hardDNA.silhouetteDrama * 0.42);
    group.add(horn);
  });

  addRidgesAlongSurface(group, skeleton, random, hardDNA, material, {
    count: 8 + Math.round(hardDNA.mesoDetail * 15),
  });
  addLayeredPlates(group, skeleton, random, hardDNA, material, {
    count: 5 + Math.round(hardDNA.mesoDetail * 10),
  });
  addCurvedSpikes(group, skeleton, random, hardDNA, material, {
    count: Math.round(hardDNA.spikeDensity * (5 + hardDNA.mesoDetail * 10)),
  });
  addPoresAndDents(group, skeleton, random, hardDNA, material, {
    count: Math.round(hardDNA.microDetail * 12),
  });

  frameObject(group, hardDNA, 'exoskeleton');
  return group;
}
