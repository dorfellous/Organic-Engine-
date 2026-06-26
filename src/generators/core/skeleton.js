import * as THREE from 'three';
import { randomBetween, randomSign } from '../seededRandom.js';

function pointOnArc(progress, dna, family, random) {
  const centered = progress - 0.5;
  const height = 4.2 + dna.height * 3.2;
  const width = 0.7 + dna.width * 2.4;
  const curvature = dna.curve * (0.8 + dna.silhouetteDrama * 0.8);
  const twist = dna.twist * Math.PI * 1.45;
  const familyBend = family === 'artifact' ? 0.5 : family === 'organism' ? 1.25 : 0.95;

  return new THREE.Vector3(
    Math.sin(centered * Math.PI * curvature) * width * familyBend + centered * dna.asymmetry * 0.55,
    centered * height,
    Math.cos(centered * Math.PI * 1.2 + twist) * curvature * (0.45 + dna.thickness) +
      Math.sin(progress * Math.PI * 2.0) * dna.chaos * 0.55 +
      randomBetween(random, -0.08, 0.08) * dna.chaos,
  );
}

function makeMirroredCurve(points, mirror = 1) {
  return points.map((point) => new THREE.Vector3(point.x * mirror, point.y, point.z));
}

export function createBranchingSkeleton(dna, random, family = 'artifact') {
  const mainCount = family === 'organism' ? 8 : 10;
  const mainPoints = Array.from({ length: mainCount }, (_, index) =>
    pointOnArc(index / (mainCount - 1), dna, family, random),
  );
  const mainCurve = new THREE.CatmullRomCurve3(mainPoints);
  const branches = [];
  const branchBase = family === 'organism' ? 4 : family === 'exoskeleton' ? 5 : 3;
  const branchCount = Math.min(12, Math.round(branchBase + dna.branching * 8 + dna.mesoDetail * 4));
  const symmetryChance = family === 'organism' ? dna.symmetry * 0.3 : dna.symmetry * 0.85;

  for (let index = 0; index < branchCount; index += 1) {
    const t = randomBetween(random, 0.12, 0.9);
    const base = mainCurve.getPoint(t);
    const tangent = mainCurve.getTangent(t);
    const side = randomSign(random);
    const direction = new THREE.Vector3(side, randomBetween(random, -0.35, 0.65), randomBetween(random, -0.9, 0.9))
      .cross(tangent)
      .normalize();
    const branchLength = randomBetween(random, 0.65, 2.4) * (0.55 + dna.branching + dna.silhouetteDrama * 0.45);
    const lift = family === 'artifact' ? 0.15 : family === 'organism' ? randomBetween(random, -0.75, 0.45) : randomBetween(random, 0.05, 0.7);
    const end = base.clone().add(direction.clone().multiplyScalar(branchLength)).add(new THREE.Vector3(0, lift, 0));
    const mid = base.clone().lerp(end, 0.55).add(new THREE.Vector3(
      randomBetween(random, -0.35, 0.35) * dna.chaos,
      randomBetween(random, -0.25, 0.35) * dna.chaos,
      randomBetween(random, -0.35, 0.35) * dna.chaos,
    ));
    const curvePoints = [base, mid, end];
    branches.push({
      curve: new THREE.CatmullRomCurve3(curvePoints),
      t,
      role: index % 3 === 0 ? 'major' : 'minor',
    });

    if (random() < symmetryChance) {
      branches.push({
        curve: new THREE.CatmullRomCurve3(makeMirroredCurve(curvePoints, -1)),
        t,
        role: 'mirror',
      });
    }
  }

  return { mainCurve, mainPoints, branches };
}
