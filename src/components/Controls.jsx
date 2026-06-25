import { DNA_LIMITS, PARAM_LABELS } from '../generators/mutateDNA.js';

export default function Controls({
  dna,
  onChange,
  onGenerateNew,
  onMutateSoft,
  onMutateHard,
  onSave,
  onCopy,
  copyStatus,
}) {
  return (
    <aside className="panel controls-panel">
      <div className="panel-header">
        <p>Generator</p>
        <strong>Alien Spine</strong>
      </div>

      <div className="button-grid">
        <button type="button" onClick={onGenerateNew}>Generate New</button>
        <button type="button" onClick={onMutateSoft}>More Like This</button>
        <button type="button" onClick={onMutateHard}>Mutate Hard</button>
        <button type="button" onClick={onSave}>Save Variation</button>
      </div>

      <div className="seed-card">
        <span>Seed</span>
        <code>{dna.seed}</code>
      </div>

      <button className="copy-button" type="button" onClick={onCopy}>
        {copyStatus || 'Copy DNA JSON'}
      </button>

      <div className="sliders">
        {Object.entries(DNA_LIMITS).map(([key, [min, max, step]]) => (
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
        ))}
      </div>
    </aside>
  );
}
