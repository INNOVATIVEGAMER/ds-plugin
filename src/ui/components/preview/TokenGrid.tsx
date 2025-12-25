import type { FlattenedToken } from '../../types/ui';
import TokenCard from './cards/TokenCard';

interface TokenGridProps {
  tokens: FlattenedToken[];
  isLoading: boolean;
}

export default function TokenGrid({ tokens, isLoading }: TokenGridProps) {
  if (isLoading) {
    return (
      <div className="token-grid-scroll">
        <div className="token-grid-empty">
          <div className="loading-spinner" />
          <div className="token-grid-empty-text">Loading tokens...</div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="token-grid-scroll">
        <div className="token-grid-empty">
          <div className="token-grid-empty-icon">📦</div>
          <div className="token-grid-empty-text">No tokens in this collection</div>
        </div>
      </div>
    );
  }

  return (
    <div className="token-grid-scroll">
      <div className="token-grid">
        {tokens.map((token) => (
          <TokenCard key={token.path} token={token} />
        ))}
      </div>
    </div>
  );
}
