import type { FlattenedToken } from '../../../types/ui';
import { parseDimensionValue, formatTokenName } from '../../../utils/tokenHelpers';

interface RadiusCardProps {
  token: FlattenedToken;
}

export default function RadiusCard({ token }: RadiusCardProps) {
  const { pixels, displayValue } = parseDimensionValue(token.value);

  // Fixed box size, apply the border radius
  const boxSize = 48;
  // Cap radius at half the box size for visibility
  const borderRadius = Math.min(pixels, boxSize / 2);

  return (
    <div className="token-card">
      <div className="token-card-preview radius-card-preview">
        <div
          className="radius-box"
          style={{
            width: `${boxSize}px`,
            height: `${boxSize}px`,
            borderRadius: `${borderRadius}px`,
          }}
        />
        <span className="radius-value">{displayValue}</span>
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value">{displayValue}</div>
      </div>
    </div>
  );
}
