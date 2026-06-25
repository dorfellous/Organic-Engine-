import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { createCurvedSpike, deformGeometry, setupGenerator } from './generatorHelpers.js';

export function generateHorn(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'horn');
  const group = new THREE.Group();
  const hornCount = 1 + Math.round(effectiveDNA.complexity * 2.2);

  for (let index = 0; index < hornCount; index += 1) {
    const offset = (index - (hornCount - 1) / 2) * randomBetween(random, 0.45, 0.85);
    const length = randomBetween(random, 3.2, 5.6) * (0.75 + effectiveDNA.vertebraSize);
    const bend = (0.45 + effectiveDNA.curve * 1.4) * randomSign(random);
    const points = [
      new THREE.Vector3(offset, -1.7, 0),
      new THREE.Vector3(offset + bend * 0.45, -0.25, randomBetween(random, -0.45, 0.45)),
      new THREE.Vector3(offset + bend, 1.25, randomBetween(random, -0.85, 0.85)),
      new THREE.Vector3(offset + bend * 0.55, length * 0.45, randomBetween(random, -0.5, 0.5)),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(
      curve,
      quality.path + 14,
      randomBetween(random, 0.19, 0.34) * effectiveDNA.vertebraSize,
      quality.radial + 6,
      false,
    );
    const position = geometry.attributes.position;

    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
      const y = position.getY(vertexIndex);
      const taper = Math.max(0.08, 1 - (y + 1.7) / Math.max(0.001, length * 0.45 + 1.7));
      position.setX(vertexIndex, position.getX(vertexIndex) * taper + offset * (1 - taper));
      position.setZ(vertexIndex, position.getZ(vertexIndex) * taper);
    }

    deformGeometry(geometry, random, effectiveDNA, 0.1);
    const horn = new THREE.Mesh(geometry, material);
    group.add(horn);

    const ridgeCount = 8 + Math.round(effectiveDNA.complexity * 14);
    for (let ridgeIndex = 0; ridgeIndex < ridgeCount; ridgeIndex += 1) {
      const t = ridgeIndex / ridgeCount;
      const point = curve.getPoint(t);
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(
          (0.21 + effectiveDNA.vertebraSize * 0.18) * (1 - t * 0.82),
          0.018 + effectiveDNA.complexity * 0.01,
          quality.radial,
          quality.radial + 8,
        ),
        material,
      );
      torus.position.copy(point);
      torus.rotation.set(Math.PI / 2 + t * effectiveDNA.twist, randomBetween(random, -0.5, 0.5), 0);
      torus.scale.x = randomBetween(random, 0.65, 1.15);
      torus.scale.y = randomBetween(random, 0.55, 0.95);
      group.add(torus);
    }

    if (effectiveDNA.spikeDensity > 0.35) {
      for (let spikeIndex = 0; spikeIndex < Math.round(effectiveDNA.spikeDensity * 7); spikeIndex += 1) {
        const spike = createCurvedSpike(random, effectiveDNA, quality, 0.7);
        const point = curve.getPoint(randomBetween(random, 0.12, 0.76));
        const outward = new THREE.Vector3(randomSign(random), randomBetween(random, -0.15, 0.25), randomSign(random)).normalize();
        spike.material = material;
        spike.position.copy(point);
        spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward);
        group.add(spike);
      }
    }
  }

  group.rotation.set(0.05, -0.35, -0.14);
  return group;
}
