import * as THREE from 'three';

export function createWetBlackMaterial(wetness = 0.8, materialColor = '#050505', metalness = 0.18) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(materialColor),
    roughness: Math.max(0.05, 0.34 - wetness * 0.25),
    metalness,
    clearcoat: 0.75 + wetness * 0.25,
    clearcoatRoughness: Math.max(0.02, 0.14 - wetness * 0.1),
    sheen: 0.35,
    sheenColor: new THREE.Color(0x1a1a1f),
    iridescence: 0.08 + wetness * 0.1,
  });
}
