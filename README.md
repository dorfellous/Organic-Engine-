# Organic Engine

Organic Engine is a browser-based procedural generative 3D tool for creating organic product-object forms from code. It currently includes an Organic Alien Spine Generator plus prompt-routed procedural families for shells, parasites, horns, pods, masks, and neckpiece artifacts. Each form can be regenerated, mutated, saved, and restored through deterministic DNA.

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

## Generators

The spine generator creates a curved central path, places repeated vertebrae-like segments along it, deforms each segment, and grows irregular curved spikes from the surface. The router can also create distinct procedural object families:

- shell: layered exoskeleton plates and ridges
- parasite: central organism bodies with tendrils and suction-like bumps
- horn: curved claws, horns, teeth, and ridged bone growths
- pod: alien eggs, cocoons, capsules, and grooved seed forms
- mask: abstract face-like wearable artifacts with cavities and panels
- neckpiece: collar, choker, and jewelry-like organic wearable forms

The same DNA object recreates the same result because generation is deterministic from the seed and parameters.

## Detail System

Organic Engine uses local procedural systems for layered noise deformation, curved spike growth, ridge lines, cavities, tendrils, secondary growths, and macro silhouette scaling. The Quality control changes geometry resolution and detail amount:

- Low
- Medium
- High
- Ultra

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
