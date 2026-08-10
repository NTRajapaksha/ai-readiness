import React from 'react';

interface QualitativeWallProps {
  items: string[];
}

export const QualitativeWall: React.FC<QualitativeWallProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="p-6 bg-surface border border-borderCustom rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <span className="data-label">Team Task Wishlist</span>
        <span className="text-xs font-mono text-ink-muted">{items.length} Responses</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((text, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-surface-raised border border-borderCustom rounded text-xs sm:text-sm text-ink italic leading-relaxed"
          >
            &ldquo;{text}&rdquo;
          </div>
        ))}
      </div>
    </div>
  );
};
