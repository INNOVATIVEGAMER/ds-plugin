import type { TextStyleInfo, EffectStyleInfo } from '../../types/ui';

interface StyleSelectorProps {
  textStyles: TextStyleInfo[];
  effectStyles: EffectStyleInfo[];
  selectedTextStyles: string[];
  selectedEffectStyles: string[];
  onToggleTextStyle: (id: string) => void;
  onToggleEffectStyle: (id: string) => void;
  onSelectAllText: () => void;
  onDeselectAllText: () => void;
  onSelectAllEffects: () => void;
  onDeselectAllEffects: () => void;
}

export default function StyleSelector({
  textStyles,
  effectStyles,
  selectedTextStyles,
  selectedEffectStyles,
  onToggleTextStyle,
  onToggleEffectStyle,
  onSelectAllText,
  onDeselectAllText,
  onSelectAllEffects,
  onDeselectAllEffects,
}: StyleSelectorProps) {
  return (
    <>
      {/* Text Styles Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Text Styles</h2>
          {textStyles.length > 0 && (
            <div className="section-actions">
              <button className="btn-link" onClick={onSelectAllText}>
                Select all
              </button>
              <span className="divider">|</span>
              <button className="btn-link" onClick={onDeselectAllText}>
                Deselect all
              </button>
            </div>
          )}
        </div>

        {textStyles.length === 0 ? (
          <p className="empty-state">No text styles found in this file.</p>
        ) : (
          <div className="styles-list">
            {textStyles.map((s) => (
              <label key={s.id} className="style-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTextStyles.includes(s.id)}
                  onChange={() => onToggleTextStyle(s.id)}
                />
                <span className="style-name">{s.name}</span>
                <span className="style-meta">
                  {s.fontFamily} · {s.fontWeight} · {s.fontSize.startsWith('{') ? s.fontSize : `${s.fontSize}px`}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Effect Styles Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Effect Styles</h2>
          {effectStyles.length > 0 && (
            <div className="section-actions">
              <button className="btn-link" onClick={onSelectAllEffects}>
                Select all
              </button>
              <span className="divider">|</span>
              <button className="btn-link" onClick={onDeselectAllEffects}>
                Deselect all
              </button>
            </div>
          )}
        </div>

        {effectStyles.length === 0 ? (
          <p className="empty-state">No effect styles found in this file.</p>
        ) : (
          <div className="styles-list">
            {effectStyles.map((s) => (
              <label key={s.id} className="style-checkbox">
                <input
                  type="checkbox"
                  checked={selectedEffectStyles.includes(s.id)}
                  onChange={() => onToggleEffectStyle(s.id)}
                />
                <span className="style-name">{s.name}</span>
                <span className="style-meta">
                  {s.effectCount} {s.effectCount === 1 ? 'effect' : 'effects'} · {s.effectTypes.join(', ')}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
