import type { ExportOptions as ExportOptionsType } from '../../types/ui';

type ColorFormat = 'hex' | 'oklch';

interface ExportOptionsProps {
  options: ExportOptionsType;
  onChange: (options: ExportOptionsType) => void;
}

export default function ExportOptions({ options, onChange }: ExportOptionsProps) {
  return (
    <div className="export-options-inline">
      <label className="export-option-item">
        <input
          type="checkbox"
          checked={options.includeDescriptions}
          onChange={(e) => onChange({ ...options, includeDescriptions: e.target.checked })}
        />
        Descriptions
      </label>

      <label className="export-option-item">
        <input
          type="checkbox"
          checked={options.resolveReferences}
          onChange={(e) => onChange({ ...options, resolveReferences: e.target.checked })}
        />
        Resolve refs
      </label>

      <label className="export-option-item">
        <span>Colors:</span>
        <select
          value={options.colorFormat}
          onChange={(e) => onChange({ ...options, colorFormat: e.target.value as ColorFormat })}
        >
          <option value="hex">Hex</option>
          <option value="oklch">OKLCH</option>
        </select>
      </label>
    </div>
  );
}
