# Organic Engine

Organic Engine is a browser-based procedural generative 3D tool for creating organic product-object forms from code. It uses prompt-routed procedural families, deterministic DNA, and a skeleton + skin geometry system to create sculptural organic forms that can be regenerated, mutated, saved, and restored.

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

## Generator Families

Organic Engine now routes prompts into three deeper procedural engines:

- Artifact / Wearable: masks, collars, jewelry-like objects, product forms, polished panels, and openings
- Organism / Parasite: soft bodies, tendrils, suction bumps, pores, asymmetry, and wet biological surfaces
- Exoskeleton / Bone: shell, horn, spine, armor, carapace, ridges, plates, and sharp skeletal growths

Legacy generator names still load safely:

- spine, shell, horn -> Exoskeleton / Bone
- parasite, pod -> Organism / Parasite
- mask, neckpiece -> Artifact / Wearable

The same DNA object recreates the same result because generation is deterministic from the seed and parameters.

## Geometry Architecture

The newer generator architecture is built around a continuous skeleton + skin system:

- procedural central curve
- deterministic secondary branches
- merged variable-radius tube skin
- seeded organic vertex deformation
- smooth normals
- sculptural ridges, folds, cavities, plates, pores, and curved talons

The goal is to avoid simple primitive assemblies and move toward continuous macro shape, meso structure, and micro surface detail.

The Quality control changes geometry resolution and detail amount:

- Preview
- High
- Ultra (slower)

Shape presets provide fast starting points:

- Wet Alien
- Bone Artifact
- Insect Armor
- Parasite Soft Body
- Minimal Wearable
- Aggressive Spiked
- Smooth Pod
- Ritual Mask

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
- macroIntensity
- mesoDetail
- microDetail
- branching
- surfaceNoise
- scale
- width
- height
- thickness
- silhouetteDrama
- detailDensity
- smoothness
- chaos
- symmetry
- openingAmount
- materialColor
- materialMetalness
- quality
- prompt
- referenceNotes
- generatorType

The interface supports generating a new DNA, creating a sibling variation, mutating harder, applying presets, saving variations to localStorage, restoring saved DNA, and copying the current DNA as JSON.

## Future Ideas

- export image
- export GLB/STL
- per-generator export presets
- local-only image reference upload
