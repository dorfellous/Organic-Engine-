import { createSeed } from './seededRandom.js';

export const DEFAULT_DNA = {
  seed: '0d15ea5e',
  segments: 18,
  curve: 0.58,
  twist: 0.55,
  spikeDensity: 0.48,
  spikeLength: 0.62,
  asymmetry: 0.55,
  wetness: 0.82,
  complexity: 0.58,
  vertebraSize: 0.62,
  organicDistortion: 0.68,
  materialColor: '#050505',
  materialMetalness: 0.18,
  prompt: 'spiky wet black alien spine, wearable product object, creature-like',
  quality: 'high',
};

export const DNA_LIMITS = {
  segments: [7, 34, 1], curve: [0, 1, 0.01], twist: [0, 1, 0.01], spikeDensity: [0, 1, 0.01], spikeLength: [0, 1, 0.01], asymmetry: [0, 1, 0.01], wetness: [0, 1, 0.01], complexity: [0, 1, 0.01], vertebraSize: [0.25, 1, 0.01], organicDistortion: [0, 1, 0.01],
};

export const QUALITY_OPTIONS = ['low', 'medium', 'high'];

export const PARAM_LABELS = {
  segments: 'Segments', curve: 'Curve', twist: 'Twist', spikeDensity: 'Spike density', spikeLength: 'Spike length', asymmetry: 'Asymmetry', wetness: 'Wetness / gloss', complexity: 'Complexity', vertebraSize: 'Vertebra size', organicDistortion: 'Organic distortion',
};

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function mutateValue(value, key, amount) {
  const [min, max, step] = DNA_LIMITS[key];
  const range = max - min;
  const mutated = value + (Math.random() * 2 - 1) * range * amount;
  const clamped = clamp(mutated, min, max);
  return step === 1 ? Math.round(clamped) : Number(clamped.toFixed(2));
}

export function getDNAWithDefaults(dna) {
  return {
    ...DEFAULT_DNA,
    ...dna,
    materialColor: dna.materialColor || DEFAULT_DNA.materialColor,
    materialMetalness: Number.isFinite(dna.materialMetalness) ? dna.materialMetalness : DEFAULT_DNA.materialMetalness,
    prompt: dna.prompt || '',
    quality: QUALITY_OPTIONS.includes(dna.quality) ? dna.quality : DEFAULT_DNA.quality,
  };
}

export function createRandomDNA() {
  return {
    seed: createSeed(),
    segments: Math.round(10 + Math.random() * 18),
    curve: Number((0.25 + Math.random() * 0.65).toFixed(2)),
    twist: Number((0.15 + Math.random() * 0.8).toFixed(2)),
    spikeDensity: Number((0.18 + Math.random() * 0.72).toFixed(2)),
    spikeLength: Number((0.22 + Math.random() * 0.72).toFixed(2)),
    asymmetry: Number((0.2 + Math.random() * 0.75).toFixed(2)),
    wetness: Number((0.65 + Math.random() * 0.35).toFixed(2)),
    complexity: Number((0.25 + Math.random() * 0.7).toFixed(2)),
    vertebraSize: Number((0.38 + Math.random() * 0.52).toFixed(2)),
    organicDistortion: Number((0.28 + Math.random() * 0.7).toFixed(2)),
    materialColor: DEFAULT_DNA.materialColor,
    materialMetalness: DEFAULT_DNA.materialMetalness,
    prompt: DEFAULT_DNA.prompt,
    quality: DEFAULT_DNA.quality,
  };
}

export function mutateDNA(dna, strength = 0.12) {
  const normalizedDNA = getDNAWithDefaults(dna);
  return Object.keys(DNA_LIMITS).reduce((nextDNA, key) => ({ ...nextDNA, [key]: mutateValue(normalizedDNA[key], key, strength) }), { ...normalizedDNA, seed: createSeed() });
}

export function updateDNAValue(dna, key, value) {
  const [min, max, step] = DNA_LIMITS[key];
  const parsed = step === 1 ? Number.parseInt(value, 10) : Number.parseFloat(value);
  return { ...dna, [key]: clamp(parsed, min, max) };
}

export function updateDNAField(dna, key, value) {
  if (key === 'quality') return { ...dna, quality: QUALITY_OPTIONS.includes(value) ? value : DEFAULT_DNA.quality };
  return { ...dna, [key]: value };
}
