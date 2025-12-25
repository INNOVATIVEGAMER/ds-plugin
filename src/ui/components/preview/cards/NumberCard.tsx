import type { FlattenedToken } from '../../../types/ui';
import { formatTokenName } from '../../../utils/tokenHelpers';

interface NumberCardProps {
  token: FlattenedToken;
}

export default function NumberCard({ token }: NumberCardProps) {
  const value = token.value;
  const displayValue = typeof value === 'number'
    ? value % 1 === 0
      ? String(value)
      : value.toFixed(2)
    : String(value);

  // Determine icon based on token type or name
  const getIcon = () => {
    const name = token.name.toLowerCase();
    const path = token.path.toLowerCase();

    if (token.type === 'fontWeight' || name.includes('weight')) return 'W';
    if (name.includes('opacity') || name.includes('alpha')) return 'α';
    if (name.includes('radius') || path.includes('radius')) return '◐';
    if (name.includes('ratio') || name.includes('scale')) return '×';
    if (name.includes('z') || name.includes('index')) return 'Z';
    return '#';
  };

  return (
    <div className="token-card number-card">
      <div className="token-card-preview number-card-preview">
        <span className="number-icon">{getIcon()}</span>
        <span className="number-value">{displayValue}</span>
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
