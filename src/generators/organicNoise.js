import * as THREE from 'three';

export function smoothNoise3(x, y, z, seed = 0) {
  const a = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 19.19) * 43758.5453;
  const b = Math.sin(x * 26.651 + y * 15.733 + z * 91.17 + seed * 7.77) * 23421.631;
  return (Math.sin(a + b) + Math.sin((a - b) * 0.37)) * 0.5;
}

export function layeredNoise(vertex, seed, octaves = 3) {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 0.85;

  for (let octave = 0; octave < octaves; octave += 1) {
    total += smoothNoise3(
      vertex.x * frequency,
      vertex.y * frequency,
      vertex.z * frequency,
      seed + octave * 13.17,
    ) * amplitude;
    amplitude *= 0.54;
    frequency *= 2.07;
  }

  return total;
}

export function organicDeformGeometry(geometry, random, dna, options = {}) {
  const {
    amount = 0.18,
    preserveSilhouette = 0.35,
    axisBias = new THREE.Vector3(1, 1, 1),
    seed = random(),
  } = options;
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const strength = amount * (0.35 + dna.organicDistortion) * (0.45 + dna.chaos * 0.75);
  const octaves = 2 + Math.round(dna.detailDensity * 3);

  geometry.computeVertexNormals();

  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    normal.fromBufferAttribute(geometry.attributes.normal, index);

    const noise = layeredNoise(vertex, seed, octaves);
    const directional = normal.multiplyScalar(noise * strength * (1 - preserveSilhouette));
    const lateral = new THREE.Vector3(
      Math.sin(vertex.y * 2.3 + seed) * axisBias.x,
      Math.cos(vertex.z * 1.9 + seed) * axisBias.y,
      Math.sin(vertex.x * 2.7 - seed) * axisBias.z,
    ).multiplyScalar(noise * strength * preserveSilhouette);

    vertex.add(directional).add(lateral);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
