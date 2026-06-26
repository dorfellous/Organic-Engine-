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
  scale: 0.62,
  width: 0.52,
  height: 0.58,
  thickness: 0.5,
  silhouetteDrama: 0.58,
  detailDensity: 0.56,
  smoothness: 0.72,
  chaos: 0.42,
  symmetry: 0.46,
  openingAmount: 0.28,
  materialColor: '#050505',
  materialMetalness: 0.18,
  prompt: 'spiky wet black alien spine, wearable product object, creature-like',
  referenceNotes: '',
  quality: 'high',
  generatorType: 'auto',
};

export const DNA_LIMITS = {
  segments: [7, 34, 1],
  curve: [0, 1, 0.01],
  twist: [0, 1, 0.01],
  spikeDensity: [0, 1, 0.01],
  spikeLength: [0, 1, 0.01],
  asymmetry: [0, 1, 0.01],
  wetness: [0, 1, 0.01],
  complexity: [0, 1, 0.01],
  vertebraSize: [0.25, 1, 0.01],
  organicDistortion: [0, 1, 0.01],
  scale: [0.35, 1.25, 0.01],
  width: [0, 1, 0.01],
  height: [0, 1, 0.01],
  thickness: [0, 1, 0.01],
  silhouetteDrama: [0, 1, 0.01],
  detailDensity: [0, 1, 0.01],
  smoothness: [0, 1, 0.01],
  chaos: [0, 1, 0.01],
  symmetry: [0, 1, 0.01],
  openingAmount: [0, 1, 0.01],
};

export const QUALITY_OPTIONS = ['low', 'medium', 'high', 'ultra'];
export const GENERATOR_TYPE_OPTIONS = [
  'auto',
  'spine',
  'shell',
  'parasite',
  'horn',
  'pod',
  'mask',
  'neckpiece',
];

export const PARAM_LABELS = {
  segments: 'Segments',
  curve: 'Curve',
  twist: 'Twist',
  spikeDensity: 'Spike density',
  spikeLength: 'Spike length',
  asymmetry: 'Asymmetry',
  wetness: 'Wetness / gloss',
  complexity: 'Complexity',
  vertebraSize: 'Vertebra size',
  organicDistortion: 'Organic distortion',
  scale: 'Scale',
  width: 'Width',
  height: 'Height',
  thickness: 'Thickness',
  silhouetteDrama: 'Silhouette drama',
  detailDensity: 'Detail density',
  smoothness: 'Smoothness',
  chaos: 'Chaos',
  symmetry: 'Symmetry',
  openingAmount: 'Openings / holes',
};

export const PARAM_GROUPS = {
  Shape: [
    'scale',
    'width',
    'height',
    'thickness',
    'silhouetteDrama',
    'curve',
    'twist',
    'asymmetry',
    'symmetry',
  ],
  Detail: [
    'segments',
    'complexity',
    'detailDensity',
    'spikeDensity',
    'spikeLength',
    'vertebraSize',
    'organicDistortion',
    'smoothness',
    'chaos',
    'openingAmount',
    'wetness',
  ],
};

export const SHAPE_PRESETS = [
  {
    id: 'wet-alien',
    label: 'Wet Alien',
    prompt: 'wet glossy black alien biological artifact with asymmetrical organic growth',
    generatorType: 'auto',
    values: {
      materialColor: '#050505',
      materialMetalness: 0.18,
      wetness: 0.95,
      organicDistortion: 0.78,
      asymmetry: 0.72,
      chaos: 0.58,
      detailDensity: 0.7,
      smoothness: 0.72,
    },
  },
  {
    id: 'bone-artifact',
    label: 'Bone Artifact',
    prompt: 'ivory bone artifact carved organic ritual object with ridges',
    generatorType: 'horn',
    values: {
      materialColor: '#d8cfb6',
      materialMetalness: 0.06,
      wetness: 0.45,
      spikeLength: 0.58,
      complexity: 0.72,
      smoothness: 0.78,
      detailDensity: 0.66,
    },
  },
  {
    id: 'insect-armor',
    label: 'Insect Armor',
    prompt: 'black insect shell exoskeleton armor carapace layered plates',
    generatorType: 'shell',
    values: {
      materialColor: '#080807',
      wetness: 0.74,
      thickness: 0.78,
      width: 0.72,
      complexity: 0.76,
      detailDensity: 0.78,
      symmetry: 0.62,
    },
  },
  {
    id: 'parasite-soft-body',
    label: 'Parasite Soft Body',
    prompt: 'wet parasite organism soft body tendrils suction bumps',
    generatorType: 'parasite',
    values: {
      wetness: 0.96,
      spikeDensity: 0.22,
      organicDistortion: 0.88,
      openingAmount: 0.46,
      smoothness: 0.86,
      chaos: 0.62,
      detailDensity: 0.72,
    },
  },
  {
    id: 'minimal-wearable',
    label: 'Minimal Wearable',
    prompt: 'smooth minimal wearable jewelry product object controlled silhouette',
    generatorType: 'neckpiece',
    values: {
      spikeDensity: 0.12,
      spikeLength: 0.2,
      organicDistortion: 0.28,
      symmetry: 0.82,
      smoothness: 0.9,
      detailDensity: 0.28,
      chaos: 0.16,
    },
  },
  {
    id: 'aggressive-spiked',
    label: 'Aggressive Spiked',
    prompt: 'aggressive sharp dangerous spiky black alien weapon artifact',
    generatorType: 'auto',
    values: {
      spikeDensity: 0.88,
      spikeLength: 0.94,
      asymmetry: 0.86,
      chaos: 0.78,
      silhouetteDrama: 0.9,
      detailDensity: 0.84,
    },
  },
  {
    id: 'smooth-pod',
    label: 'Smooth Pod',
    prompt: 'smooth wet alien egg pod cocoon capsule with soft grooves',
    generatorType: 'pod',
    values: {
      spikeDensity: 0.08,
      spikeLength: 0.12,
      smoothness: 0.94,
      openingAmount: 0.38,
      organicDistortion: 0.34,
      symmetry: 0.7,
      wetness: 0.86,
    },
  },
  {
    id: 'ritual-mask',
    label: 'Ritual Mask',
    prompt: 'alien ritual mask face headpiece with eye cavities and layered panels',
    generatorType: 'mask',
    values: {
      height: 0.82,
      width: 0.42,
      openingAmount: 0.72,
      detailDensity: 0.66,
      symmetry: 0.72,
      silhouetteDrama: 0.74,
      complexity: 0.72,
    },
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mutateValue(value, key, amount) {
  const [min, max, step] = DNA_LIMITS[key];
  const range = max - min;
  const mutated = value + (Math.random() * 2 - 1) * range * amount;
  const clamped = clamp(mutated, min, max);

  if (step === 1) {
    return Math.round(clamped);
  }

  return Number(clamped.toFixed(2));
}

export function getDNAWithDefaults(dna) {
  return {
    ...DEFAULT_DNA,
    ...dna,
    materialColor: dna.materialColor || DEFAULT_DNA.materialColor,
    materialMetalness: Number.isFinite(dna.materialMetalness)
      ? dna.materialMetalness
      : DEFAULT_DNA.materialMetalness,
    prompt: dna.prompt || '',
    referenceNotes: dna.referenceNotes || '',
    quality: QUALITY_OPTIONS.includes(dna.quality) ? dna.quality : DEFAULT_DNA.quality,
    generatorType: GENERATOR_TYPE_OPTIONS.includes(dna.generatorType)
      ? dna.generatorType
      : DEFAULT_DNA.generatorType,
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
    scale: Number((0.48 + Math.random() * 0.52).toFixed(2)),
    width: Number((0.28 + Math.random() * 0.62).toFixed(2)),
    height: Number((0.28 + Math.random() * 0.62).toFixed(2)),
    thickness: Number((0.25 + Math.random() * 0.65).toFixed(2)),
    silhouetteDrama: Number((0.25 + Math.random() * 0.7).toFixed(2)),
    detailDensity: Number((0.25 + Math.random() * 0.7).toFixed(2)),
    smoothness: Number((0.45 + Math.random() * 0.5).toFixed(2)),
    chaos: Number((0.15 + Math.random() * 0.72).toFixed(2)),
    symmetry: Number((0.25 + Math.random() * 0.65).toFixed(2)),
    openingAmount: Number((0.05 + Math.random() * 0.65).toFixed(2)),
    materialColor: DEFAULT_DNA.materialColor,
    materialMetalness: DEFAULT_DNA.materialMetalness,
    prompt: DEFAULT_DNA.prompt,
    referenceNotes: DEFAULT_DNA.referenceNotes,
    quality: DEFAULT_DNA.quality,
    generatorType: DEFAULT_DNA.generatorType,
  };
}

export function applyPresetToDNA(dna, presetId) {
  const preset = SHAPE_PRESETS.find((item) => item.id === presetId);

  if (!preset) {
    return getDNAWithDefaults(dna);
  }

  return getDNAWithDefaults({
    ...dna,
    ...preset.values,
    prompt: preset.prompt,
    generatorType: preset.generatorType,
  });
}

export function mutateDNA(dna, strength = 0.12) {
  const normalizedDNA = getDNAWithDefaults(dna);

  return Object.keys(DNA_LIMITS).reduce(
    (nextDNA, key) => ({
      ...nextDNA,
      [key]: mutateValue(normalizedDNA[key], key, strength),
    }),
    { ...normalizedDNA, seed: createSeed() },
  );
}

export function updateDNAValue(dna, key, value) {
  const [min, max, step] = DNA_LIMITS[key];
  const parsed = step === 1 ? Number.parseInt(value, 10) : Number.parseFloat(value);

  return {
    ...dna,
    [key]: clamp(parsed, min, max),
  };
}

export function updateDNAField(dna, key, value) {
  if (key === 'quality') {
    return {
      ...dna,
      quality: QUALITY_OPTIONS.includes(value) ? value : DEFAULT_DNA.quality,
    };
  }

  if (key === 'generatorType') {
    return {
      ...dna,
      generatorType: GENERATOR_TYPE_OPTIONS.includes(value) ? value : DEFAULT_DNA.generatorType,
    };
  }

  return {
    ...dna,
    [key]: value,
  };
}
