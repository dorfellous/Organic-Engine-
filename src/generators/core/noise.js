import * as THREE from 'three';

export function seededNoise3(x, y, z, seed = 0) {
  const a = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 17.17) * 43758.5453;
  const b = Math.sin(x * 34.123 + y * 19.87 + z * 91.413 + seed * 5.31) * 24634.6345;
  return (Math.sin(a + b) + Math.sin((a - b) * 0.41)) * 0.5;
}

export function layeredNoise3(point, seed, options = {}) {
  const octaves = options.octaves ?? 4;
  let total = 0;
  let amplitude = 0.52;
  let frequency = options.frequency ?? 0.9;
  let norm = 0;

  for (let index = 0; index < octaves; index += 1) {
    total += seededNoise3(point.x * frequency, point.y * frequency, point.z * frequency, seed + index * 11.37) * amplitude;
    norm += amplitude;
    amplitude *= 0.54;
    frequency *= 2.03;
  }

  return total / Math.max(0.001, norm);
}

export function deformGeometryOrganic(geometry, random, dna, options = {}) {
  const amount = options.intensity ?? 0.16;
  const scale = options.scale ?? 1;
  const preserve = options.preserveSilhouette ?? 0.45;
  const seed = options.seed ?? random();
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  geometry.computeVertexNormals();

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    normal.fromBufferAttribute(geometry.attributes.normal, index);

    const coarse = layeredNoise3(vertex.clone().multiplyScalar(scale), seed, {
      octaves: 3 + Math.round((dna.microDetail ?? 0.55) * 2),
      frequency: 0.65 + (dna.surfaceNoise ?? 0.55),
    });
    const fine = layeredNoise3(vertex.clone().multiplyScalar(scale * 2.7), seed + 19.4, {
      octaves: 2,
      frequency: 1.4,
    });
    const strength = amount * (0.35 + (dna.surfaceNoise ?? dna.organicDistortion ?? 0.55)) * (0.55 + (dna.chaos ?? 0.35));
    const directional = normal.clone().multiplyScalar((coarse * 0.8 + fine * 0.2) * strength * (1 - preserve));
    const lateral = new THREE.Vector3(
      Math.sin(vertex.y * 1.7 + seed),
      Math.cos(vertex.z * 1.9 - seed),
      Math.sin(vertex.x * 2.1 + seed * 0.4),
    ).multiplyScalar(coarse * strength * preserve * 0.55);

    vertex.add(directional).add(lateral);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
