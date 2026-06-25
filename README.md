# Organic Engine

Organic Engine is a browser-based procedural generative 3D tool for creating organic product-object forms from code. The first generator is an Organic Alien Spine Generator: a black, wet, glossy, spiky, asymmetrical alien spine that can be regenerated, mutated, saved, and restored through deterministic DNA.

This project is not an AI image generator and not a text-to-3D model. It does not connect to external AI services, paid APIs, Meshy, Tripo, Midjourney, or any other model provider. The forms are generated entirely with procedural geometry, seeded randomness, React, Vite, and Three.js.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## First Generator

The Organic Alien Spine Generator creates a curved central path, places repeated vertebrae-like segments along it, deforms each segment, and grows irregular curved spikes from the surface. The same DNA object recreates the same result because generation is deterministic from the seed and parameters.

DNA parameters include:

- seed
- segments
- curve
- twist
- spikeDensity
- spikeLength
- asymmetry
- wetness
- complexity
- vertebraSize
- organicDistortion

The interface supports generating a new DNA, creating a sibling variation, mutating harder, saving variations to localStorage, restoring saved DNA, and copying the current DNA as JSON.

## Future Ideas

- mask generator
- parasite generator
- horn generator
- wearable artifact generator
- export image
- export GLB/STL
