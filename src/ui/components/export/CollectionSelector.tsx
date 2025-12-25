import type { CollectionInfo } from '../../types/ui';

interface CollectionSelectorProps {
  collections: CollectionInfo[];
  selectedCollections: string[];
  selectedModes: Record<string, string[]>;
  onToggleCollection: (id: string) => void;
  onToggleMode: (collectionId: string, modeId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function CollectionSelector({
  collections,
  selectedCollections,
  selectedModes,
  onToggleCollection,
  onToggleMode,
  onSelectAll,
  onDeselectAll,
}: CollectionSelectorProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Collections</h2>
        <div className="section-actions">
          <button className="btn-link" onClick={onSelectAll}>
            Select all
          </button>
          <span className="divider">|</span>
          <button className="btn-link" onClick={onDeselectAll}>
            Deselect all
          </button>
        </div>
      </div>

      {collections.length === 0 ? (
        <p className="empty-state">No variable collections found in this file.</p>
      ) : (
        <div className="collections-list">
          {collections.map((c) => (
            <div key={c.id} className="collection-checkbox">
              <label className="collection-header">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(c.id)}
                  onChange={() => onToggleCollection(c.id)}
                />
                <span className="collection-name">{c.name}</span>
                <span className="collection-count">{c.variableCount} variables</span>
              </label>

              {selectedCollections.includes(c.id) && c.modes.length > 1 && (
                <div className="modes-list">
                  {c.modes.map((mode) => (
                    <label key={mode.modeId} className="mode-checkbox">
                      <input
                        type="checkbox"
                        checked={(selectedModes[c.id] || []).includes(mode.modeId)}
                        onChange={() => onToggleMode(c.id, mode.modeId)}
                      />
                      {mode.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
