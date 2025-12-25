import type { FlattenedToken } from '../../../types/ui';
import { formatTokenName } from '../../../utils/tokenHelpers';

interface TypographyValue {
  fontFamily?: string | { value: string };
  fontSize?: { value: number; unit: string } | number;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: { value: number; unit: string };
}

interface TypographyCardProps {
  token: FlattenedToken;
}

export default function TypographyCard({ token }: TypographyCardProps) {
  const typo = token.value as TypographyValue;

  // Extract values
  const fontFamily = typeof typo.fontFamily === 'object'
    ? typo.fontFamily.value
    : typo.fontFamily || 'inherit';

  const fontSize = typeof typo.fontSize === 'object'
    ? typo.fontSize.value
    : typeof typo.fontSize === 'number'
    ? typo.fontSize
    : 16;

  const fontWeight = typo.fontWeight || 400;

  const lineHeight = typo.lineHeight === 'auto' || typo.lineHeight === undefined
    ? 'normal'
    : typo.lineHeight;

  // Cap preview font size
  const previewSize = Math.min(fontSize, 28);

  // Build description
  const description = `${fontWeight} / ${fontSize}px`;

  return (
    <div className="token-card typography-card">
      <div className="token-card-preview typography-card-preview">
        <div
          className="typography-sample"
          style={{
            fontFamily,
            fontSize: `${previewSize}px`,
            fontWeight,
            lineHeight,
          }}
        >
          Aa
        </div>
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={token.path}>
          {formatTokenName(token)}
        </div>
        <div className="token-card-value" title={`${fontFamily} / ${description}`}>
          {description}
        </div>
      </div>
    </div>
  );
}
