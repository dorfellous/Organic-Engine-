import React from 'react';
import {
  DNA_LIMITS,
  GENERATOR_TYPE_OPTIONS,
  PARAM_LABELS,
  PARAM_GROUPS,
  QUALITY_OPTIONS,
  SHAPE_PRESETS,
} from '../generators/mutateDNA.js';

export default function Controls({
  dna,
  promptAnalysis,
  onChange,
  onFieldChange,
  onApplyPrompt,
  onApplyPreset,
  onGenerateNew,
  onMutateSoft,
  onMutateHard,
  onSave,
  onCopy,
  copyStatus,
}) {
  return (
    <section className="controls-panel">
      <div className="panel-header">
        <p>Organic Engine</p>
        <strong>Procedural controls</strong>
      </div>

      <div className="button-grid compact">
        <button type="button" onClick={onGenerateNew}>Generate New</button>
        <button type="button" onClick={onMutateSoft}>More Like This</button>
        <button type="button" onClick={onMutateHard}>Mutate Hard</button>
      </div>

      <details className="control-section" open>
        <summary>Prompt</summary>
        <label className="text-field">
          <span>Prompt / Direction</span>
          <textarea
            value={dna.prompt}
            rows="3"
            maxLength="260"
            placeholder="wet parasite organism with tendrils, suction bumps, asymmetric soft body"
            onChange={(event) => onFieldChange('prompt', event.target.value)}
          />
        </label>

        <label className="text-field">
          <span>Reference Notes</span>
          <textarea
            value={dna.referenceNotes}
            rows="2"
            maxLength="220"
            placeholder="more like insect armor, less spine, smoother wearable object"
            onChange={(event) => onFieldChange('referenceNotes', event.target.value)}
          />
        </label>

        <button className="apply-prompt-button" type="button" onClick={onApplyPrompt}>
          Apply Prompt
        </button>

        <div className="detected-tags">
          <span>Detected</span>
          <p>
            Family: {promptAnalysis.generatorType} ({promptAnalysis.generatorSource})
          </p>
          <p>
            Material:{' '}
            {promptAnalysis.materialTags.length > 0
              ? promptAnalysis.materialTags.join(', ')
              : 'none'}
          </p>
          <p>
            Shape:{' '}
            {promptAnalysis.shapeTags.length > 0
              ? promptAnalysis.shapeTags.join(', ')
              : 'none'}
          </p>
        </div>
      </details>

      <details className="control-section" open>
        <summary>Generator</summary>
        <label className="select-field">
          <span>Family</span>
          <select
            value={dna.generatorType}
            aria-label="Family"
            onChange={(event) => onFieldChange('generatorType', event.target.value)}
          >
            {GENERATOR_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type === 'auto'
                  ? 'Auto from prompt'
                  : type === 'artifact'
                    ? 'Artifact / Wearable'
                    : type === 'organism'
                      ? 'Organism / Parasite'
                      : 'Exoskeleton / Bone'}
              </option>
            ))}
          </select>
        </label>

        <label className="select-field">
          <span>Shape preset</span>
          <select
            defaultValue=""
            aria-label="Shape preset"
            onChange={(event) => {
              if (event.target.value) {
                onApplyPreset(event.target.value);
                event.target.value = '';
              }
            }}
          >
            <option value="">Choose preset...</option>
            {SHAPE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <div className="preset-grid">
          {SHAPE_PRESETS.map((preset) => (
            <button key={preset.id} type="button" onClick={() => onApplyPreset(preset.id)}>
              {preset.label}
            </button>
          ))}
        </div>
      </details>

      <details className="control-section" open>
        <summary>Material</summary>
        <label className="color-row">
          <span>Material color</span>
          <input
            type="color"
            value={dna.materialColor}
            onChange={(event) => onFieldChange('materialColor', event.target.value)}
            aria-label="Material color"
          />
        </label>

        <label className="select-field">
          <span>Model quality</span>
          <select
            value={dna.quality}
            aria-label="Model quality"
            onChange={(event) => onFieldChange('quality', event.target.value)}
          >
            {QUALITY_OPTIONS.map((quality) => (
              <option key={quality} value={quality}>
                {quality === 'preview' ? 'Preview' : quality === 'ultra' ? 'Ultra (slower)' : 'High'}
              </option>
            ))}
          </select>
        </label>
      </details>

      {Object.entries(PARAM_GROUPS).map(([groupName, keys]) => (
        <details className="control-section" key={groupName} open={groupName === 'Shape'}>
          <summary>{groupName}</summary>
          <div className="sliders">
            {keys.map((key) => {
              const [min, max, step] = DNA_LIMITS[key];
              return (
                <label className="slider-row" key={key}>
                  <span>
                    {PARAM_LABELS[key]}
                    <b>{dna[key]}</b>
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={dna[key]}
                    onChange={(event) => onChange(key, event.target.value)}
                  />
                </label>
              );
            })}
          </div>
        </details>
      ))}

      <div className="action-row">
        <button type="button" onClick={onSave}>Save Variation</button>
        <button className="copy-button" type="button" onClick={onCopy}>
          {copyStatus || 'Copy DNA'}
        </button>
      </div>

      <div className="seed-card">
        <span>Seed</span>
        <code>{dna.seed}</code>
      </div>
    </section>
  );
}
