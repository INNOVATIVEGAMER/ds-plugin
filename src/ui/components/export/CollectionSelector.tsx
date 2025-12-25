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
  const allSelected = collections.length > 0 && selectedCollections.length === collections.length;

  return (
    <>
      <div className="export-section-header">
        <span className="export-section-title">Collections</span>
        <div className="export-section-actions">
          <button
            className="btn btn-ghost btn-xs"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? 'None' : 'All'}
          </button>
        </div>
      </div>

      <div className="export-list">
        {collections.length === 0 ? (
          <div className="export-empty-state">No collections found</div>
        ) : (
          collections.map((c) => {
            const isSelected = selectedCollections.includes(c.id);
            const collectionModes = selectedModes[c.id] || [];

            return (
              <div key={c.id} className="export-collection-item">
                <label className="export-collection-header">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleCollection(c.id)}
                  />
                  <span className="export-collection-name">{c.name}</span>
                  <span className="export-collection-count">{c.variableCount}</span>
                </label>

                {isSelected && c.modes.length > 1 && (
                  <div className="export-modes">
                    {c.modes.map((mode) => (
                      <span
                        key={mode.modeId}
                        className={`export-mode-pill ${collectionModes.includes(mode.modeId) ? 'selected' : ''}`}
                        onClick={() => onToggleMode(c.id, mode.modeId)}
                      >
                        {mode.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
