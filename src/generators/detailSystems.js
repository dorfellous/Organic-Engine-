import * as THREE from 'three';
import { randomBetween, randomSign } from './seededRandom.js';
import { randomDirection, taperedTube } from './geometryUtils.js';

export function createOrganicSpike(random, dna, quality, material, options = {}) {
  const {
    length = randomBetween(random, 0.35, 1.4) * (0.45 + dna.spikeLength),
    base = randomBetween(random, 0.035, 0.11) * (0.65 + dna.thickness),
    curveAmount = 0.16 + dna.silhouetteDrama * 0.32,
  } = options;
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(curveAmount * randomSign(random), length * 0.35, curveAmount * randomSign(random)),
    new THREE.Vector3(curveAmount * 0.7 * randomSign(random), length * 0.78, curveAmount * 0.48 * randomSign(random)),
    new THREE.Vector3(curveAmount * 0.25 * randomSign(random), length, curveAmount * 0.22 * randomSign(random)),
  ];
  const spike = new THREE.Mesh(
    taperedTube(new THREE.CatmullRomCurve3(points), quality, random, dna, base, 0.96, 0.06),
    material,
  );
  return spike;
}

export function addGroupedSpikes(group, random, dna, material, quality, anchors, options = {}) {
  const density = options.density ?? dna.spikeDensity;
  const clusterChance = 0.22 + dna.chaos * 0.36;
  const count = Math.round(anchors.length * density * (0.28 + dna.detailDensity));

  for (let index = 0; index < count; index += 1) {
    const anchor = anchors[Math.floor(randomBetween(random, 0, anchors.length))];
    const clusterSize = random() < clusterChance ? 2 + Math.round(random() * 3 * dna.detailDensity) : 1;

    for (let spikeIndex = 0; spikeIndex < clusterSize; spikeIndex += 1) {
      const spike = createOrganicSpike(random, dna, quality, material, {
        length: randomBetween(random, 0.18, 1.35) * (0.35 + dna.spikeLength) * (options.lengthScale ?? 1),
      });
      const direction = anchor.clone().normalize().add(randomDirection(random).multiplyScalar(0.25 + dna.chaos * 0.28)).normalize();
      spike.position.copy(anchor).add(direction.clone().multiplyScalar(randomBetween(random, -0.08, 0.12)));
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      spike.rotateY(randomBetween(random, -0.8, 0.8));
      group.add(spike);
    }
  }
}

export function addRidgeLines(group, random, dna, material, quality, options = {}) {
  const count = options.count ?? 3 + Math.round(dna.detailDensity * 8);
  const radius = options.radius ?? 1.2;
  const length = options.length ?? 2.6;

  for (let index = 0; index < count; index += 1) {
    const side = randomSign(random);
    const y = randomBetween(random, -length * 0.42, length * 0.42);
    const z = randomBetween(random, -radius * 0.45, radius * 0.45);
    const points = [
      new THREE.Vector3(-radius * randomBetween(random, 0.7, 1.1), y + randomBetween(random, -0.24, 0.24), z),
      new THREE.Vector3(0, y + randomBetween(random, -0.16, 0.22), z + side * randomBetween(random, 0.08, 0.32)),
      new THREE.Vector3(radius * randomBetween(random, 0.7, 1.1), y + randomBetween(random, -0.24, 0.24), z * randomBetween(random, 0.35, 0.8)),
    ];
    const ridge = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        quality.path,
        (options.thickness ?? 0.025) + dna.detailDensity * 0.018,
        quality.radial,
        false,
      ),
      material,
    );
    group.add(ridge);
  }
}

export function addCavities(group, random, dna, material, options = {}) {
  const count = options.count ?? Math.round(dna.openingAmount * (2 + dna.detailDensity * 6));
  const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x010102 });

  for (let index = 0; index < count; index += 1) {
    const position = options.position
      ? options.position.clone().add(randomDirection(random).multiplyScalar(randomBetween(random, 0, 0.4)))
      : randomDirection(random, -0.4, 0.65).multiplyScalar(randomBetween(random, 0.55, options.radius ?? 1.2));
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        randomBetween(random, 0.08, 0.28) * (0.65 + dna.openingAmount),
        randomBetween(random, 0.012, 0.04),
        12 + Math.round(dna.smoothness * 10),
        24 + Math.round(dna.smoothness * 16),
      ),
      material,
    );
    ring.position.copy(position);
    ring.lookAt(position.clone().multiplyScalar(1.8));
    ring.scale.x = randomBetween(random, 0.55, 1.45);
    ring.scale.y = randomBetween(random, 0.55, 1.1);
    group.add(ring);

    const voidMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 18, 12),
      darkMaterial,
    );
    voidMesh.position.copy(position);
    voidMesh.scale.set(ring.scale.x * 1.2, ring.scale.y * 0.72, 0.12);
    group.add(voidMesh);
  }
}

export function addTendrils(group, random, dna, material, quality, anchors, options = {}) {
  const count = options.count ?? Math.round((4 + dna.detailDensity * 10) * (0.55 + dna.chaos));

  for (let index = 0; index < count; index += 1) {
    const anchor = anchors[Math.floor(randomBetween(random, 0, anchors.length))];
    const direction = anchor.clone().normalize().add(randomDirection(random).multiplyScalar(0.4 + dna.chaos * 0.35)).normalize();
    const length = randomBetween(random, 0.9, 3.2) * (0.7 + dna.silhouetteDrama);
    const path = new THREE.CatmullRomCurve3([
      anchor,
      anchor.clone().add(direction.clone().multiplyScalar(length * 0.32)).add(randomDirection(random).multiplyScalar(0.34)),
      anchor.clone().add(direction.clone().multiplyScalar(length * 0.7)).add(randomDirection(random).multiplyScalar(0.58)),
      anchor.clone().add(direction.clone().multiplyScalar(length)),
    ]);
    const tendril = new THREE.Mesh(
      taperedTube(path, quality, random, dna, randomBetween(random, 0.035, 0.1) * (0.7 + dna.thickness), 0.72, 0.07),
      material,
    );
    group.add(tendril);
  }
}

export function addSecondaryGrowths(group, random, dna, material, quality, anchors, options = {}) {
  const count = options.count ?? Math.round(anchors.length * (0.15 + dna.detailDensity * 0.35));

  for (let index = 0; index < count; index += 1) {
    const anchor = anchors[Math.floor(randomBetween(random, 0, anchors.length))];
    const growth = new THREE.Mesh(
      new THREE.SphereGeometry(
        randomBetween(random, 0.06, 0.22) * (0.8 + dna.thickness),
        quality.radial + 8,
        quality.radial,
      ),
      material,
    );
    growth.position.copy(anchor).add(randomDirection(random).multiplyScalar(randomBetween(random, 0.05, 0.2)));
    growth.scale.set(
      randomBetween(random, 0.55, 1.8),
      randomBetween(random, 0.42, 1.25),
      randomBetween(random, 0.45, 1.35),
    );
    growth.rotation.set(randomBetween(random, -1, 1), randomBetween(random, -1, 1), randomBetween(random, -1, 1));
    group.add(growth);
  }
}
