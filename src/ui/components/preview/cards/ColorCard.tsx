import type { FlattenedToken } from '../../../types/ui';
import { convertColorToCSS } from '../../../utils/cssVariables';
import { formatTokenName } from '../../../utils/tokenHelpers';

interface ColorCardProps {
  token: FlattenedToken;
}

export default function ColorCard({ token }: ColorCardProps) {
  const colorValue = convertColorToCSS(token.value);

  // Check if color has alpha
  const hasAlpha = colorValue.includes('/') ||
    (typeof colorValue === 'string' && colorValue.length === 9); // #rrggbbaa

  return (
    <div className="token-card">
      <div className="token-card-preview color-card-preview">
        {hasAlpha && <div className="color-checker-bg" />}
        <div
          className="color-swatch"
          style={{ backgroundColor: colorValue }}
        />
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value" title={colorValue}>
          {colorValue}
        </div>
      </div>
    </div>
  );
}
