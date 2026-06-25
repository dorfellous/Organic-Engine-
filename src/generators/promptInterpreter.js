import { getDNAWithDefaults } from './mutateDNA.js';

export const GENERATOR_RULES = [
  {
    type: 'spine',
    label: 'spine',
    words: ['spine', 'vertebrae', 'backbone', 'חוליות', 'עמוד שדרה', 'שדרה'],
  },
  {
    type: 'shell',
    label: 'shell',
    words: ['shell', 'exoskeleton', 'carapace', 'armor', 'insect shell', 'שריון', 'קונכייה', 'חרק', 'אקסוסקלטון'],
  },
  {
    type: 'parasite',
    label: 'parasite',
    words: ['parasite', 'organism', 'tendrils', 'tentacles', 'creature', 'טפיל', 'זרועות', 'מחושים', 'אורגניזם'],
  },
  {
    type: 'horn',
    label: 'horn',
    words: ['horn', 'claw', 'tooth', 'bone', 'talon', 'קרן', 'טופר', 'שן', 'עצם'],
  },
  {
    type: 'pod',
    label: 'pod',
    words: ['egg', 'pod', 'cocoon', 'seed', 'capsule', 'ביצה', 'גולם', 'קפסולה', 'זרע'],
  },
  {
    type: 'mask',
    label: 'mask',
    words: ['mask', 'face', 'helmet', 'headpiece', 'מסכה', 'פנים', 'קסדה', 'הדפיס'],
  },
  {
    type: 'neckpiece',
    label: 'neckpiece',
    words: ['neckpiece', 'collar', 'necklace', 'choker', 'jewelry', 'צוואר', 'קולר', 'שרשרת', 'תכשיט'],
  },
];

const MATERIAL_TAGS = new Set(['wet', 'matte', 'bone', 'black', 'pale', 'red', 'silver']);

const PROMPT_RULES = [
  {
    tag: 'long',
    words: ['long', 'elongated', 'tall', 'ארוך', 'מאורך'],
    apply: (dna, strength) => ({
      ...dna,
      segments: clampInt(dna.segments + 6 * strength, 7, 34),
      curve: clamp01(dna.curve + 0.12 * strength),
    }),
  },
  {
    tag: 'compact',
    words: ['short', 'compact', 'קצר', 'קומפקטי'],
    apply: (dna, strength) => ({
      ...dna,
      segments: clampInt(dna.segments - 6 * strength, 7, 34),
      curve: clamp01(dna.curve - 0.04 * strength),
    }),
  },
  {
    tag: 'slim',
    words: ['thin', 'slim', 'delicate', 'דק', 'עדין'],
    apply: (dna, strength) => ({
      ...dna,
      vertebraSize: clampRange(dna.vertebraSize - 0.14 * strength, 0.25, 1),
      spikeLength: clamp01(dna.spikeLength - 0.06 * strength),
    }),
  },
  {
    tag: 'massive',
    words: ['thick', 'heavy', 'chunky', 'massive', 'עבה', 'מסיבי', 'כבד'],
    apply: (dna, strength) => ({
      ...dna,
      vertebraSize: clampRange(dna.vertebraSize + 0.16 * strength, 0.25, 1),
      complexity: clamp01(dna.complexity + 0.12 * strength),
    }),
  },
  {
    tag: 'spiky',
    words: ['spiky', 'spikes', 'thorn', 'thorns', 'sharp', 'ספייקי', 'קוצני', 'קוצים', 'חד'],
    apply: (dna, strength) => ({
      ...dna,
      spikeDensity: clamp01(dna.spikeDensity + 0.2 * strength),
      spikeLength: clamp01(dna.spikeLength + 0.18 * strength),
    }),
  },
  {
    tag: 'smooth',
    words: ['smooth', 'soft', 'minimal', 'חלק', 'מינימלי'],
    apply: (dna, strength) => ({
      ...dna,
      spikeDensity: clamp01(dna.spikeDensity - 0.24 * strength),
      spikeLength: clamp01(dna.spikeLength - 0.16 * strength),
      organicDistortion: clamp01(dna.organicDistortion - 0.18 * strength),
      complexity: clamp01(dna.complexity - 0.08 * strength),
    }),
  },
  {
    tag: 'aggressive',
    words: ['aggressive', 'violent', 'dangerous'],
    apply: (dna, strength) => ({
      ...dna,
      spikeLength: clamp01(dna.spikeLength + 0.18 * strength),
      asymmetry: clamp01(dna.asymmetry + 0.16 * strength),
      twist: clamp01(dna.twist + 0.12 * strength),
      complexity: clamp01(dna.complexity + 0.12 * strength),
    }),
  },
  {
    tag: 'wet',
    words: ['wet', 'glossy', 'slimy', 'liquid', 'רטוב', 'מבריק', 'נוזלי'],
    apply: (dna, strength) => ({
      ...dna,
      wetness: clamp01(dna.wetness + 0.22 * strength),
    }),
  },
  {
    tag: 'matte',
    words: ['matte', 'dry', 'powdery'],
    apply: (dna, strength) => ({
      ...dna,
      wetness: clamp01(dna.wetness - 0.34 * strength),
    }),
  },
  {
    tag: 'bone',
    words: ['bone', 'ivory', 'skeleton', 'עצם', 'שלד', 'שנהב'],
    apply: (dna, strength) => ({
      ...dna,
      materialColor: '#d8cfb6',
      wetness: clamp01(dna.wetness - 0.08 * strength),
      complexity: clamp01(dna.complexity + 0.14 * strength),
    }),
  },
  {
    tag: 'black',
    words: ['black', 'dark', 'שחור'],
    apply: (dna) => ({
      ...dna,
      materialColor: '#050505',
      materialMetalness: 0.18,
    }),
  },
  {
    tag: 'pale',
    words: ['white', 'pale'],
    apply: (dna) => ({
      ...dna,
      materialColor: '#dcd8ce',
      materialMetalness: 0.08,
    }),
  },
  {
    tag: 'red',
    words: ['red', 'blood', 'flesh'],
    apply: (dna, strength) => ({
      ...dna,
      materialColor: '#5b0b10',
      wetness: clamp01(dna.wetness + 0.08 * strength),
      materialMetalness: 0.12,
    }),
  },
  {
    tag: 'silver',
    words: ['silver', 'chrome', 'metal'],
    apply: (dna, strength) => ({
      ...dna,
      materialColor: '#aeb2b6',
      wetness: clamp01(dna.wetness + 0.08 * strength),
      materialMetalness: 0.62,
    }),
  },
  {
    tag: 'organic',
    words: ['organic', 'biological', 'creature', 'animal', 'אורגני', 'ביולוגי', 'חייתי'],
    apply: (dna, strength) => ({
      ...dna,
      organicDistortion: clamp01(dna.organicDistortion + 0.18 * strength),
      asymmetry: clamp01(dna.asymmetry + 0.12 * strength),
    }),
  },
  {
    tag: 'alien',
    words: ['alien', 'xenomorph', 'parasite', 'חייזרי', 'טפילי'],
    apply: (dna, strength) => ({
      ...dna,
      asymmetry: clamp01(dna.asymmetry + 0.16 * strength),
      twist: clamp01(dna.twist + 0.14 * strength),
      complexity: clamp01(dna.complexity + 0.12 * strength),
      spikeDensity: clamp01(dna.spikeDensity + 0.1 * strength),
    }),
  },
  {
    tag: 'insect',
    words: ['insect', 'exoskeleton', 'shell', 'חרקי'],
    apply: (dna, strength) => ({
      ...dna,
      complexity: clamp01(dna.complexity + 0.16 * strength),
      vertebraSize: clampRange(dna.vertebraSize + 0.1 * strength, 0.25, 1),
      twist: clamp01(dna.twist + 0.08 * strength),
    }),
  },
  {
    tag: 'product',
    words: ['jewelry', 'wearable', 'product', 'artifact'],
    apply: (dna, strength) => ({
      ...dna,
      asymmetry: clamp01(dna.asymmetry - 0.08 * strength),
      organicDistortion: clamp01(dna.organicDistortion - 0.07 * strength),
      complexity: clamp01(dna.complexity + 0.06 * strength),
    }),
  },
  {
    tag: 'twisted',
    words: ['twisted', 'spiral', 'rotated', 'מפותל', 'ספירלי'],
    apply: (dna, strength) => ({
      ...dna,
      twist: clamp01(dna.twist + 0.24 * strength),
    }),
  },
  {
    tag: 'curved',
    words: ['curved', 'bent', 'arched', 'מעוקל', 'מקומר'],
    apply: (dna, strength) => ({
      ...dna,
      curve: clamp01(dna.curve + 0.22 * strength),
    }),
  },
  {
    tag: 'straight',
    words: ['straight', 'rigid'],
    apply: (dna, strength) => ({
      ...dna,
      curve: clamp01(dna.curve - 0.22 * strength),
      twist: clamp01(dna.twist - 0.18 * strength),
    }),
  },
  {
    tag: 'ornate',
    words: ['complex', 'detailed', 'ornate'],
    apply: (dna, strength) => ({
      ...dna,
      complexity: clamp01(dna.complexity + 0.2 * strength),
      organicDistortion: clamp01(dna.organicDistortion + 0.12 * strength),
    }),
  },
  {
    tag: 'simple',
    words: ['simple', 'clean'],
    apply: (dna, strength) => ({
      ...dna,
      complexity: clamp01(dna.complexity - 0.18 * strength),
      spikeDensity: clamp01(dna.spikeDensity - 0.14 * strength),
      organicDistortion: clamp01(dna.organicDistortion - 0.14 * strength),
    }),
  },
];

const MODE_STRENGTH = {
  apply: 1,
  new: 1,
  soft: 0.82,
  hard: 1.16,
  render: 1,
};

function clamp01(value) {
  return clampRange(value, 0, 1);
}

function clampInt(value, min, max) {
  return Math.round(clampRange(value, min, max));
}

function clampRange(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function normalizePrompt(prompt) {
  return String(prompt || '').toLowerCase();
}

function matchesWord(prompt, word) {
  const normalizedWord = word.toLowerCase();

  if (/^[a-z0-9 -]+$/.test(normalizedWord)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedWord)}([^a-z0-9]|$)`).test(prompt);
  }

  return prompt.includes(normalizedWord);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectPromptTags(prompt) {
  const normalizedPrompt = normalizePrompt(prompt);

  if (!normalizedPrompt.trim()) {
    return [];
  }

  return PROMPT_RULES.filter((rule) =>
    rule.words.some((word) => matchesWord(normalizedPrompt, word)),
  ).map((rule) => rule.tag);
}

export function detectGeneratorType(prompt, fallback = 'spine') {
  const normalizedPrompt = normalizePrompt(prompt);

  if (!normalizedPrompt.trim()) {
    return fallback;
  }

  const match = GENERATOR_RULES.find((rule) =>
    rule.words.some((word) => matchesWord(normalizedPrompt, word)),
  );

  return match?.type || fallback;
}

export function analyzePrompt(prompt, dna = {}) {
  const tags = detectPromptTags(prompt);
  const baseDNA = getDNAWithDefaults(dna);
  const detectedGeneratorType = detectGeneratorType(prompt, 'spine');
  const isManual = baseDNA.generatorType && baseDNA.generatorType !== 'auto';
  const generatorType = isManual ? baseDNA.generatorType : detectedGeneratorType;

  return {
    generatorType,
    generatorSource: isManual ? 'manual' : 'prompt',
    materialTags: tags.filter((tag) => MATERIAL_TAGS.has(tag)),
    shapeTags: tags.filter((tag) => !MATERIAL_TAGS.has(tag)),
    allTags: tags,
  };
}

export function interpretPromptToDNA(prompt, currentDNA, mode = 'apply') {
  const normalizedPrompt = normalizePrompt(prompt);
  const strength = MODE_STRENGTH[mode] || MODE_STRENGTH.apply;
  const baseDNA = getDNAWithDefaults({ ...currentDNA, prompt: prompt || currentDNA.prompt || '' });

  if (!normalizedPrompt.trim()) {
    return baseDNA;
  }

  const interpretedDNA = PROMPT_RULES.reduce((nextDNA, rule) => {
    const isMatched = rule.words.some((word) => matchesWord(normalizedPrompt, word));
    return isMatched ? rule.apply(nextDNA, strength) : nextDNA;
  }, baseDNA);

  return cleanDNA(interpretedDNA);
}

function cleanDNA(dna) {
  return {
    ...dna,
    segments: clampInt(dna.segments, 7, 34),
    curve: round(clamp01(dna.curve)),
    twist: round(clamp01(dna.twist)),
    spikeDensity: round(clamp01(dna.spikeDensity)),
    spikeLength: round(clamp01(dna.spikeLength)),
    asymmetry: round(clamp01(dna.asymmetry)),
    wetness: round(clamp01(dna.wetness)),
    complexity: round(clamp01(dna.complexity)),
    vertebraSize: round(clampRange(dna.vertebraSize, 0.25, 1)),
    organicDistortion: round(clamp01(dna.organicDistortion)),
    materialMetalness: round(clamp01(dna.materialMetalness)),
    generatorType: dna.generatorType,
  };
}

function round(value) {
  return Number(value.toFixed(2));
}
