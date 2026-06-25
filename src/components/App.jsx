import React, { useEffect, useMemo, useState } from 'react';
import Viewport from './Viewport.jsx';
import Controls from './Controls.jsx';
import SavedGallery from './SavedGallery.jsx';
import {
  DEFAULT_DNA,
  createRandomDNA,
  mutateDNA,
  updateDNAValue,
} from '../generators/mutateDNA.js';

const STORAGE_KEY = 'organic-engine.saved-variations';
const DNA_KEYS = [
  'seed',
  'segments',
  'curve',
  'twist',
  'spikeDensity',
  'spikeLength',
  'asymmetry',
  'wetness',
  'complexity',
  'vertebraSize',
  'organicDistortion',
];

function sanitizeDNA(source) {
  return DNA_KEYS.reduce(
    (nextDNA, key) => ({
      ...nextDNA,
      [key]: source[key] ?? DEFAULT_DNA[key],
    }),
    {},
  );
}

function loadSavedVariations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Keep viewport failures visible instead of leaving the page as an empty root.
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <section className="viewport-shell viewport-failed">
          <div className="viewport-header">
            <div>
              <p>Organic Engine</p>
              <h1>Viewport failed to initialize</h1>
            </div>
            <span>Runtime error</span>
          </div>
          <div className="viewport-message">
            <strong>3D viewport error</strong>
            <span>{this.state.error.message}</span>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [dna, setDNA] = useState(DEFAULT_DNA);
  const [savedItems, setSavedItems] = useState(loadSavedVariations);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  const dnaJSON = useMemo(() => JSON.stringify(dna, null, 2), [dna]);

  function handleChange(key, value) {
    setDNA((currentDNA) => updateDNAValue(currentDNA, key, value));
  }

  function handleSave() {
    setSavedItems((items) => [
      { ...dna, savedAt: new Date().toISOString() },
      ...items.filter((item) => item.seed !== dna.seed).slice(0, 11),
    ]);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(dnaJSON);
    setCopyStatus('DNA copied');
    window.setTimeout(() => setCopyStatus(''), 1200);
  }

  return (
    <main className="app-shell">
      <Controls
        dna={dna}
        onChange={handleChange}
        onGenerateNew={() => setDNA(createRandomDNA())}
        onMutateSoft={() => setDNA((currentDNA) => mutateDNA(currentDNA, 0.08))}
        onMutateHard={() => setDNA((currentDNA) => mutateDNA(currentDNA, 0.24))}
        onSave={handleSave}
        onCopy={handleCopy}
        copyStatus={copyStatus}
      />
      <AppErrorBoundary>
        <Viewport dna={dna} />
      </AppErrorBoundary>
      <SavedGallery
        savedItems={savedItems}
        onRestore={(item) => setDNA(sanitizeDNA(item))}
        onClear={() => setSavedItems([])}
      />
    </main>
  );
}
