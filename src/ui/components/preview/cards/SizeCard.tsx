import { useState } from 'react';
import type { FlattenedToken } from '../../../types/ui';
import { parseDimensionValue, formatTokenName } from '../../../utils/tokenHelpers';

interface SizeCardProps {
  token: FlattenedToken;
}

export default function SizeCard({ token }: SizeCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { pixels, displayValue } = parseDimensionValue(token.value);

  // Max size that fits comfortably in preview area
  const maxPreviewSize = 80;
  const isOverflow = pixels > maxPreviewSize;
  const squareSize = isOverflow ? maxPreviewSize : pixels;

  const handleClick = () => {
    if (isOverflow) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="token-card">
        <div
          className={`token-card-preview size-card-preview ${isOverflow ? 'clickable' : ''}`}
          onClick={handleClick}
        >
          {pixels === 0 ? (
            <span className="size-empty">0</span>
          ) : (
            <>
              <div
                className={`size-square ${isOverflow ? 'overflow' : ''}`}
                style={{
                  width: `${squareSize}px`,
                  height: `${squareSize}px`,
                }}
              />
              <span className="size-hint">
                {isOverflow ? 'Click to preview' : '1:1'}
              </span>
            </>
          )}
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

      {showModal && (
        <div className="size-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="size-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-modal-header">
              <span className="size-modal-title">{token.name}</span>
              <button className="size-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="size-modal-content">
              <div
                className="size-modal-square"
                style={{
                  width: `${Math.min(pixels, 300)}px`,
                  height: `${Math.min(pixels, 300)}px`,
                }}
              />
              <span className="size-modal-value">{displayValue}</span>
              {pixels > 300 && (
                <span className="size-modal-note">Capped at 300px for display</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
