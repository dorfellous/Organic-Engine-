import * as THREE from 'three';
import { addCavitiesOrOpenings, addCurvedSpikes, addPoresAndDents, addRidgesAlongSurface } from '../core/surfaceDetails.js';
import { createOrganicTubeAlongCurve, getQualityProfile } from '../core/skinGeometry.js';
import { createSculpturalBase, frameObject, setupFamily } from './familyHelpers.js';

export function generateOrganismParasite(dna) {
  const { dna: effectiveDNA, random, material } = setupFamily(dna, 'organism');
  const softDNA = {
    ...effectiveDNA,
    wetness: Math.max(effectiveDNA.wetness, 0.78),
    branching: Math.max(effectiveDNA.branching, 0.45),
    surfaceNoise: Math.max(effectiveDNA.surfaceNoise, 0.52),
    microDetail: Math.max(effectiveDNA.microDetail, 0.48),
  };
  const quality = getQualityProfile(softDNA);
  const { group, skeleton } = createSculpturalBase(softDNA, random, material, 'organism', {
    mainRadius: 0.62 + softDNA.thickness * 0.22,
    branchRadius: 0.2 + softDNA.branching * 0.08,
    maxBranches: 14,
    profile: 'organic',
    branchProfile: 'tendril',
    deform: 0.15 + softDNA.microDetail * 0.08,
    branchDeform: 0.12,
  });

  skeleton.branches.slice(0, 10 + Math.round(softDNA.branching * 8)).forEach((branch) => {
    const tendril = new THREE.Mesh(
      createOrganicTubeAlongCurve(branch.curve, random, softDNA, {
        baseRadius: 0.08 + softDNA.thickness * 0.06,
        lengthSegments: quality.branchSegments,
        radialSegments: Math.max(12, Math.round(quality.radialSegments * 0.52)),
        profile: 'tendril',
        deform: 0.13,
      }),
      material,
    );
    tendril.scale.multiplyScalar(1.15 + softDNA.silhouetteDrama * 0.35);
    group.add(tendril);
  });

  addRidgesAlongSurface(group, skeleton, random, softDNA, material, {
    count: 3 + Math.round(softDNA.mesoDetail * 7),
  });
  addCavitiesOrOpenings(group, skeleton, random, softDNA, material, {
    count: Math.round(softDNA.openingAmount * 7),
  });
  addPoresAndDents(group, skeleton, random, softDNA, material, {
    count: 10 + Math.round(softDNA.microDetail * 34),
  });

  if (softDNA.spikeDensity > 0.36) {
    addCurvedSpikes(group, skeleton, random, softDNA, material, {
      count: Math.round(softDNA.spikeDensity * 5),
    });
  }

  frameObject(group, softDNA, 'organism');
  return group;
}
