import React from 'react';
import { DNA_LIMITS, PARAM_LABELS, QUALITY_OPTIONS } from '../generators/mutateDNA.js';

export default function Controls({ dna, promptTags, onChange, onFieldChange, onApplyPrompt, onGenerateNew, onMutateSoft, onMutateHard, onSave, onCopy, copyStatus }) {
  return (
    <aside className="panel controls-panel">
      <div className="panel-header"><p>Generator</p><strong>Alien Spine</strong></div>
      <div className="button-grid">
        <button type="button" onClick={onGenerateNew}>Generate New</button>
        <button type="button" onClick={onMutateSoft}>More Like This</button>
        <button type="button" onClick={onMutateHard}>Mutate Hard</button>
        <button type="button" onClick={onSave}>Save Variation</button>
      </div>
      <div className="seed-card"><span>Seed</span><code>{dna.seed}</code></div>
      <button className="copy-button" type="button" onClick={onCopy}>{copyStatus || 'Copy DNA JSON'}</button>
      <div className="field-group">
        <label className="color-row"><span>Material color</span><input type="color" value={dna.materialColor} onChange={(event) => onFieldChange('materialColor', event.target.value)} aria-label="Material color" /></label>
        <label className="text-field">
          <span>Prompt / Direction</span>
          <textarea value={dna.prompt} rows="4" maxLength="220" placeholder="spiky wet black alien spine, wearable product object, creature-like" onChange={(event) => onFieldChange('prompt', event.target.value)} />
        </label>
        <button className="apply-prompt-button" type="button" onClick={onApplyPrompt}>Apply Prompt</button>
        <div className="detected-tags"><span>Detected</span><p>{promptTags.length > 0 ? promptTags.join(', ') : 'No prompt tags yet'}</p></div>
        <label className="select-field">
          <span>Model quality</span>
          <select value={dna.quality} onChange={(event) => onFieldChange('quality', event.target.value)}>
            {QUALITY_OPTIONS.map((quality) => <option key={quality} value={quality}>{quality[0].toUpperCase() + quality.slice(1)}</option>)}
          </select>
        </label>
      </div>
      <div className="sliders">
        {Object.entries(DNA_LIMITS).map(([key, [min, max, step]]) => (
          <label className="slider-row" key={key}>
            <span>{PARAM_LABELS[key]}<b>{dna[key]}</b></span>
            <input type="range" min={min} max={max} step={step} value={dna[key]} onChange={(event) => onChange(key, event.target.value)} />
          </label>
        ))}
      </div>
    </aside>
  );
}
