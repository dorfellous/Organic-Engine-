export function createSeed() {
  return Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
}

export function hashSeed(seed) {
  const text = String(seed);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = hashSeed(seed) || 1;

  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomBetween(random, min, max) {
  return min + (max - min) * random();
}

export function randomSign(random) {
  return random() > 0.5 ? 1 : -1;
}
