import type { TextStylePreview } from '../../../types/ui';

interface TextStyleCardProps {
  style: TextStylePreview;
}

export default function TextStyleCard({ style }: TextStyleCardProps) {
  // Build the CSS style object for the preview
  const previewStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${Math.min(style.fontSize, 48)}px`, // Cap for preview
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight === 'AUTO' ? 'normal' : style.lineHeight,
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
  };

  // Format display values
  const fontSizeDisplay = `${style.fontSize}px`;
  const lineHeightDisplay = style.lineHeight === 'AUTO' ? 'Auto' :
    (typeof style.lineHeight === 'number' && style.lineHeight < 4)
      ? style.lineHeight.toFixed(2)
      : `${style.lineHeight}px`;

  return (
    <div className="token-card text-style-card">
      <div className="token-card-preview text-style-card-preview">
        <span className="text-style-sample" style={previewStyle}>
          Aa
        </span>
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={style.name}>
          {style.name}
        </div>
        <div className="text-style-details">
          <span className="text-style-font">{style.fontFamily} {style.fontWeight}</span>
          <span className="text-style-meta">
            {fontSizeDisplay} / {lineHeightDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}
