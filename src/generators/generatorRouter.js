import { getDNAWithDefaults } from './mutateDNA.js';
import { detectGeneratorType } from './promptInterpreter.js';
import { generateAlienSpine } from './spineGenerator.js';
import { generateShell } from './shellGenerator.js';
import { generateParasite } from './parasiteGenerator.js';
import { generateHorn } from './hornGenerator.js';
import { generatePod } from './podGenerator.js';
import { generateMask } from './maskGenerator.js';
import { generateNeckpiece } from './neckpieceGenerator.js';

export const GENERATORS = {
  spine: generateAlienSpine,
  shell: generateShell,
  parasite: generateParasite,
  horn: generateHorn,
  pod: generatePod,
  mask: generateMask,
  neckpiece: generateNeckpiece,
};

export function resolveGeneratorType(dna) {
  const effectiveDNA = getDNAWithDefaults(dna);

  if (effectiveDNA.generatorType && effectiveDNA.generatorType !== 'auto') {
    return GENERATORS[effectiveDNA.generatorType] ? effectiveDNA.generatorType : 'spine';
  }

  return detectGeneratorType(`${effectiveDNA.prompt} ${effectiveDNA.referenceNotes}`, 'spine');
}

export function generateOrganicObject(dna) {
  const generatorType = resolveGeneratorType(dna);
  const generator = GENERATORS[generatorType] || generateAlienSpine;
  return generator({ ...dna, resolvedGeneratorType: generatorType });
}
