import { getDNAWithDefaults, normalizeGeneratorType } from './mutateDNA.js';
import { detectGeneratorType } from './promptInterpreter.js';
import { generateArtifactWearable } from './families/artifactGenerator.js';
import { generateOrganismParasite } from './families/organismGenerator.js';
import { generateExoskeletonBone } from './families/exoskeletonGenerator.js';

export const FAMILY_GENERATORS = {
  artifact: generateArtifactWearable,
  organism: generateOrganismParasite,
  exoskeleton: generateExoskeletonBone,
};

export const LEGACY_TO_FAMILY = {
  spine: 'exoskeleton',
  shell: 'exoskeleton',
  horn: 'exoskeleton',
  parasite: 'organism',
  pod: 'organism',
  mask: 'artifact',
  neckpiece: 'artifact',
};

export function resolveGeneratorType(dna) {
  const effectiveDNA = getDNAWithDefaults(dna);
  const normalizedType = normalizeGeneratorType(effectiveDNA.generatorType);

  if (normalizedType && normalizedType !== 'auto') {
    return FAMILY_GENERATORS[normalizedType] ? normalizedType : 'exoskeleton';
  }

  return detectGeneratorType(`${effectiveDNA.prompt} ${effectiveDNA.referenceNotes}`, 'exoskeleton');
}

export function generateOrganicObject(dna) {
  const family = resolveGeneratorType(dna);
  const generator = FAMILY_GENERATORS[family] || generateExoskeletonBone;
  return generator({ ...dna, resolvedGeneratorType: family });
}
