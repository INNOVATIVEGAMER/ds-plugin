import type { FlattenedToken } from '../../../types/ui';
import { parseDimensionValue, formatTokenName } from '../../../utils/tokenHelpers';

interface BorderWidthCardProps {
  token: FlattenedToken;
}

export default function BorderWidthCard({ token }: BorderWidthCardProps) {
  const { pixels, displayValue } = parseDimensionValue(token.value);

  // Clamp border width for visibility (1-8px for preview)
  const borderWidth = Math.min(Math.max(pixels, 1), 8);

  return (
    <div className="token-card">
      <div className="token-card-preview border-width-card-preview">
        <div
          className="border-width-box"
          style={{
            borderWidth: `${borderWidth}px`,
          }}
        />
        <span className="border-width-value">{displayValue}</span>
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value">
          {displayValue}
        </div>
      </div>
    </div>
  );
}
