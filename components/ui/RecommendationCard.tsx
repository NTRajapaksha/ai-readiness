import React from 'react';
import { Recommendation } from '@/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onClick,
}) => {
  const isHighPriority = recommendation.priority === 'high';

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-surface border border-borderCustom rounded-lg space-y-3 transition-colors ${
        onClick ? 'cursor-pointer hover:border-accent/60' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isHighPriority ? 'bg-taiCoral' : 'bg-taiViolet'
            }`}
          />
          <h3 className="font-sans font-semibold text-ink text-sm sm:text-base leading-snug">
            {recommendation.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0 pl-4 sm:pl-0">
          {recommendation.targetTeam && (
            <span className="px-2 py-0.5 bg-taiViolet/10 text-taiViolet border border-taiViolet/20 rounded text-[10px] font-mono uppercase font-semibold">
              {recommendation.targetTeam}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
              isHighPriority
                ? 'bg-taiCoral/10 text-taiCoral border border-taiCoral/30'
                : 'bg-surface-raised text-ink-muted border border-borderCustom'
            }`}
          >
            {recommendation.priority} Priority
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-4 border-l-2 border-borderCustom">
        {recommendation.description}
      </p>

      {onClick && (
        <div className="flex items-center justify-end pt-1">
          <span className="text-xs font-mono font-medium text-accent hover:text-accent-dark inline-flex items-center gap-1">
            View 3-Week Playbook →
          </span>
        </div>
      )}
    </div>
  );
};
