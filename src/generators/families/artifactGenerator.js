import * as THREE from 'three';
import { addCavitiesOrOpenings, addLayeredPlates, addRidgesAlongSurface, addPoresAndDents } from '../core/surfaceDetails.js';
import { createSculpturalBase, frameObject, setupFamily } from './familyHelpers.js';

export function generateArtifactWearable(dna) {
  const { dna: effectiveDNA, random, material } = setupFamily(dna, 'artifact');
  const polishedDNA = {
    ...effectiveDNA,
    branching: Math.min(0.62, effectiveDNA.branching),
    chaos: effectiveDNA.chaos * 0.62,
    symmetry: Math.max(effectiveDNA.symmetry, 0.62),
    surfaceNoise: effectiveDNA.surfaceNoise * 0.72,
  };
  const { group, skeleton } = createSculpturalBase(polishedDNA, random, material, 'artifact', {
    mainRadius: 0.5 + polishedDNA.thickness * 0.18,
    branchRadius: 0.16 + polishedDNA.thickness * 0.07,
    maxBranches: 9,
    profile: 'organic',
    branchProfile: 'tendril',
    deform: 0.07 + polishedDNA.microDetail * 0.04,
  });

  const panelMaterial = material.clone();
  panelMaterial.roughness = Math.min(0.52, panelMaterial.roughness + 0.08);

  addLayeredPlates(group, skeleton, random, polishedDNA, panelMaterial, {
    count: 4 + Math.round(polishedDNA.mesoDetail * 9),
  });
  addRidgesAlongSurface(group, skeleton, random, polishedDNA, panelMaterial, {
    count: 4 + Math.round(polishedDNA.mesoDetail * 8),
  });
  addCavitiesOrOpenings(group, skeleton, random, polishedDNA, material, {
    count: 1 + Math.round(polishedDNA.openingAmount * 5),
  });
  addPoresAndDents(group, skeleton, random, polishedDNA, material, {
    count: Math.round(polishedDNA.microDetail * 14),
  });

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.2 + polishedDNA.width * 0.75, 0.035 + polishedDNA.thickness * 0.035, 20, 86),
    panelMaterial,
  );
  halo.position.y = -0.35;
  halo.rotation.x = Math.PI / 2 + polishedDNA.curve * 0.28;
  halo.scale.y = 0.42 + polishedDNA.openingAmount * 0.28;
  group.add(halo);

  frameObject(group, polishedDNA, 'artifact');
  return group;
}
