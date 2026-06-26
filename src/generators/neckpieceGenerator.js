import * as THREE from 'three';
import { randomBetween } from './seededRandom.js';
import { addGroupedSpikes, addSecondaryGrowths } from './detailSystems.js';
import { createCurvedSpike, deformGeometry, setupGenerator } from './generatorHelpers.js';
import { familyScale } from './geometryUtils.js';

export function generateNeckpiece(dna) {
  const { dna: effectiveDNA, random, material, quality } = setupGenerator(dna, 'neckpiece');
  const group = new THREE.Group();
  const segmentCount = Math.max(10, Math.round(effectiveDNA.segments * (0.62 + effectiveDNA.detailDensity * 0.28)));
  const arcStart = Math.PI * (0.12 + effectiveDNA.curve * 0.08);
  const arcEnd = Math.PI * (1.88 - effectiveDNA.curve * 0.08);
  const radius = 1.85 + effectiveDNA.vertebraSize * 0.7 + effectiveDNA.width * 0.75;
  const anchors = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const progress = segmentCount <= 1 ? 0 : index / (segmentCount - 1);
    const angle = arcStart + (arcEnd - arcStart) * progress;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.55;
    const y = Math.sin(progress * Math.PI) * (0.2 + effectiveDNA.silhouetteDrama * 0.44);
    const geometry = new THREE.SphereGeometry(
      randomBetween(random, 0.28, 0.5) * effectiveDNA.vertebraSize,
      quality.sphereW,
      quality.sphereH,
    );
    geometry.scale(
      randomBetween(random, 1.05, 1.55) * (0.75 + effectiveDNA.width * 0.5),
      randomBetween(random, 0.46, 0.92) * (0.72 + effectiveDNA.thickness * 0.55),
      randomBetween(random, 0.45, 1.05),
    );
    deformGeometry(geometry, random, effectiveDNA, 0.12);

    const segment = new THREE.Mesh(geometry, material);
    segment.position.set(x, y, z);
    segment.rotation.set(randomBetween(random, -0.2, 0.2), -angle + Math.PI / 2, angle * effectiveDNA.twist * 0.25);
    group.add(segment);
    anchors.push(segment.position.clone());

    if (random() < effectiveDNA.spikeDensity * 0.88) {
      const spike = createCurvedSpike(random, effectiveDNA, quality, 0.85);
      const outward = new THREE.Vector3(x, randomBetween(random, 0.1, 0.55), z).normalize();
      spike.material = material;
      spike.position.copy(segment.position).add(outward.clone().multiplyScalar(0.25));
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward);
      group.add(spike);
    }
  }

  const innerCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 18 }, (_, index) => {
      const t = index / 17;
      const angle = arcStart + (arcEnd - arcStart) * t;
      return new THREE.Vector3(Math.cos(angle) * radius * 0.82, Math.sin(t * Math.PI) * 0.1, Math.sin(angle) * radius * 0.45);
    }),
  );
  const cord = new THREE.Mesh(
    new THREE.TubeGeometry(innerCurve, quality.path + 12, 0.07 + effectiveDNA.complexity * 0.025, quality.radial, false),
    material,
  );
  group.add(cord);

  addSecondaryGrowths(group, random, effectiveDNA, material, quality, anchors, {
    count: Math.round(anchors.length * effectiveDNA.detailDensity * 0.65),
  });
  addGroupedSpikes(group, random, effectiveDNA, material, quality, anchors, {
    density: effectiveDNA.spikeDensity * 0.45,
    lengthScale: 0.45,
  });
  group.rotation.set(-0.1, -0.12, 0);
  group.scale.setScalar(0.95);
  familyScale(group, effectiveDNA, { width: 0.28, height: 0.08, thickness: 0.25 });
  return group;
}
