import type { FlattenedToken } from '../../../types/ui';
import { formatTokenName } from '../../../utils/tokenHelpers';

interface FontFamilyCardProps {
  token: FlattenedToken;
}

export default function FontFamilyCard({ token }: FontFamilyCardProps) {
  const fontFamily = String(token.value);

  // Get clean font name for display
  const displayName = fontFamily.replace(/["']/g, '').split(',')[0].trim();

  return (
    <div className="token-card font-family-card">
      <div className="token-card-preview font-family-card-preview">
        <span
          className="font-sample"
          style={{ fontFamily }}
        >
          Aa
        </span>
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value" title={fontFamily}>
          {displayName}
        </div>
      </div>
    </div>
  );
}
