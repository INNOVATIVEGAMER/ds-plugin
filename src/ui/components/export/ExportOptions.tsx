import type { ExportOptions as ExportOptionsType } from '../../types/ui';

type ColorFormat = 'hex' | 'oklch';

interface ExportOptionsProps {
  options: ExportOptionsType;
  onChange: (options: ExportOptionsType) => void;
}

export default function ExportOptions({ options, onChange }: ExportOptionsProps) {
  return (
    <section className="section">
      <h2 className="section-title">Options</h2>
      <div className="options-grid">
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={options.includeDescriptions}
            onChange={(e) => onChange({ ...options, includeDescriptions: e.target.checked })}
          />
          Include descriptions
        </label>

        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={options.resolveReferences}
            onChange={(e) => onChange({ ...options, resolveReferences: e.target.checked })}
          />
          Resolve references
        </label>

        <div className="option-row">
          <span>Color format:</span>
          <select
            value={options.colorFormat}
            onChange={(e) => onChange({ ...options, colorFormat: e.target.value as ColorFormat })}
          >
            <option value="hex">Hex (#rrggbb)</option>
            <option value="oklch">OKLCH</option>
          </select>
        </div>
      </div>
    </section>
  );
}
