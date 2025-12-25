import type { TextStylePreview, EffectStylePreview } from '../../types/ui';
import TextStyleCard from './cards/TextStyleCard';
import EffectStyleCard from './cards/EffectStyleCard';

interface StylesGridProps {
  textStyles: TextStylePreview[];
  effectStyles: EffectStylePreview[];
  viewType: 'text' | 'effect';
}

export default function StylesGrid({ textStyles, effectStyles, viewType }: StylesGridProps) {
  const isEmpty = viewType === 'text' ? textStyles.length === 0 : effectStyles.length === 0;

  if (isEmpty) {
    return (
      <div className="token-grid-scroll">
        <div className="token-grid-empty">
          <div className="token-grid-empty-icon">
            {viewType === 'text' ? 'Aa' : '\u2588'}
          </div>
          <div className="token-grid-empty-text">
            No {viewType === 'text' ? 'text' : 'effect'} styles found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="token-grid-scroll">
      <div className="token-grid styles-grid">
        {viewType === 'text'
          ? textStyles.map((style) => (
              <TextStyleCard key={style.id} style={style} />
            ))
          : effectStyles.map((style) => (
              <EffectStyleCard key={style.id} style={style} />
            ))}
      </div>
    </div>
  );
}
