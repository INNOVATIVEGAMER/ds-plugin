import type { FlattenedToken } from '../../../types/ui';
import { convertShadowToCSS } from '../../../utils/cssVariables';
import { formatTokenName } from '../../../utils/tokenHelpers';

interface ShadowCardProps {
  token: FlattenedToken;
}

export default function ShadowCard({ token }: ShadowCardProps) {
  const shadowCSS = convertShadowToCSS(token.value);

  // Check if it's an inset shadow
  const isInset = shadowCSS.includes('inset');

  return (
    <div className="token-card shadow-card">
      <div className="token-card-preview shadow-card-preview">
        <div
          className={`shadow-box ${isInset ? 'inset' : ''}`}
          style={{ boxShadow: shadowCSS }}
        />
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value" title={shadowCSS}>
          {isInset ? 'inset' : 'drop shadow'}
        </div>
      </div>
    </div>
  );
}
