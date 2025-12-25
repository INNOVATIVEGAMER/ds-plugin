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
  const allTextSelected = textStyles.length > 0 && selectedTextStyles.length === textStyles.length;
  const allEffectsSelected = effectStyles.length > 0 && selectedEffectStyles.length === effectStyles.length;

  return (
    <>
      <div className="export-section-header">
        <span className="export-section-title">Styles</span>
      </div>

      <div className="export-list">
        {/* Text Styles */}
        {textStyles.length > 0 && (
          <div className="export-styles-subsection">
            <div className="export-styles-subsection-header">
              <span className="export-styles-subsection-title">Text Styles</span>
              <button
                className="btn btn-ghost btn-xs"
                onClick={allTextSelected ? onDeselectAllText : onSelectAllText}
              >
                {allTextSelected ? 'None' : 'All'}
              </button>
            </div>
            {textStyles.map((s) => (
              <label key={s.id} className="export-style-item">
                <input
                  type="checkbox"
                  checked={selectedTextStyles.includes(s.id)}
                  onChange={() => onToggleTextStyle(s.id)}
                />
                <span className="export-style-name">{s.name}</span>
              </label>
            ))}
          </div>
        )}

        {/* Effect Styles */}
        {effectStyles.length > 0 && (
          <div className="export-styles-subsection">
            <div className="export-styles-subsection-header">
              <span className="export-styles-subsection-title">Effect Styles</span>
              <button
                className="btn btn-ghost btn-xs"
                onClick={allEffectsSelected ? onDeselectAllEffects : onSelectAllEffects}
              >
                {allEffectsSelected ? 'None' : 'All'}
              </button>
            </div>
            {effectStyles.map((s) => (
              <label key={s.id} className="export-style-item">
                <input
                  type="checkbox"
                  checked={selectedEffectStyles.includes(s.id)}
                  onChange={() => onToggleEffectStyle(s.id)}
                />
                <span className="export-style-name">{s.name}</span>
              </label>
            ))}
          </div>
        )}

        {textStyles.length === 0 && effectStyles.length === 0 && (
          <div className="export-empty-state">No styles found</div>
        )}
      </div>
    </>
  );
}
