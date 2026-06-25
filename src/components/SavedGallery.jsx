import React from 'react';

export default function SavedGallery({ savedItems, onRestore, onClear }) {
  function summarizePrompt(prompt) {
    if (!prompt) {
      return 'No prompt saved';
    }

    return prompt.length > 58 ? `${prompt.slice(0, 58)}...` : prompt;
  }

  return (
    <aside className="panel gallery-panel">
      <div className="panel-header">
        <p>Local gallery</p>
        <strong>Saved variations</strong>
      </div>

      {savedItems.length > 0 && (
        <button className="clear-button" type="button" onClick={onClear}>
          Clear Gallery
        </button>
      )}

      <div className="saved-list">
        {savedItems.length === 0 ? (
          <p className="empty-state">Saved DNA will appear here and survive refresh.</p>
        ) : (
          savedItems.map((item) => (
            <button
              type="button"
              className="saved-item"
              key={`${item.seed}-${item.savedAt}`}
              onClick={() => onRestore(item)}
            >
              <span className="saved-seed">{item.seed}</span>
              <span>{item.segments} segments</span>
              <span>
                spikes {item.spikeDensity} / gloss {item.wetness}
              </span>
              <span className="saved-prompt">{summarizePrompt(item.prompt)}</span>
              <span className="saved-meta">
                <i style={{ backgroundColor: item.materialColor || '#050505' }} />
                {item.quality || 'medium'} quality
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
