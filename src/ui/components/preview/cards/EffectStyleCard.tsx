import type { EffectStylePreview } from '../../../types/ui';

interface EffectStyleCardProps {
  style: EffectStylePreview;
}

export default function EffectStyleCard({ style }: EffectStyleCardProps) {
  // Build box-shadow CSS from effects
  const boxShadow = style.effects
    .map((e) => {
      const inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
      return `${inset}${e.offsetX}px ${e.offsetY}px ${e.blur}px ${e.spread}px ${e.color}`;
    })
    .join(', ');

  // Check if any effects are inset
  const hasInset = style.effects.some((e) => e.type === 'INNER_SHADOW');
  const hasDropShadow = style.effects.some((e) => e.type === 'DROP_SHADOW');

  // Get effect type label
  const typeLabel = hasInset && hasDropShadow
    ? 'Mixed'
    : hasInset
    ? 'Inner'
    : 'Drop';

  return (
    <div className="token-card effect-style-card">
      <div className="token-card-preview effect-style-card-preview">
        <div
          className={`effect-style-box ${hasInset ? 'inset' : ''}`}
          style={{ boxShadow }}
        />
      </div>
      <div className="token-card-info">
        <div className="token-card-name" title={style.name}>
          {style.name}
        </div>
        <div className="effect-style-meta">
          <span className="effect-style-type">{typeLabel}</span>
          <span className="effect-style-count">
            {style.effects.length} {style.effects.length === 1 ? 'layer' : 'layers'}
          </span>
        </div>
      </div>
    </div>
  );
}
