interface Mode {
  modeId: string;
  name: string;
}

interface ModeSelectorProps {
  modes: Mode[];
  selectedModeId: string | null;
  onSelect: (modeId: string) => void;
}

export default function ModeSelector({
  modes,
  selectedModeId,
  onSelect,
}: ModeSelectorProps) {
  if (modes.length <= 1) {
    return null;
  }

  return (
    <div className="mode-selector">
      {modes.map((mode) => (
        <button
          key={mode.modeId}
          className={`mode-button ${selectedModeId === mode.modeId ? 'active' : ''}`}
          onClick={() => onSelect(mode.modeId)}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
}
