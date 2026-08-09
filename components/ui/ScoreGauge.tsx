'use client';

import React, { useEffect, useState } from 'react';
import { getScoreCategory } from '@/lib/scoring';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  totalResponses?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, totalResponses }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Determine stroke color based on monochrome scale (#C9D6D6 low → #6FA3A3 mid → #2A6F6F high)
  let strokeColor = '#C9D6D6';
  if (score >= 40 && score < 70) {
    strokeColor = '#6FA3A3';
  } else if (score >= 70) {
    strokeColor = '#2A6F6F';
  }

  const category = getScoreCategory(score);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s ease-out

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quadratic
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      setDisplayScore(Math.round(easeProgress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  // SVG Geometry
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface border border-borderCustom rounded-lg text-center">
      <span className="data-label mb-3">Overall AI Readiness</span>

      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E0D8"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 50ms linear' }}
          />
        </svg>

        {/* Center score count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-5xl font-semibold text-ink leading-none">
            {displayScore}
          </span>
          <span className="text-xs text-ink-muted mt-1 font-mono">/ 100</span>
        </div>
      </div>

      {/* Category Tag */}
      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-borderCustom rounded-full">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: strokeColor }}
        />
        <span className="data-label text-[11px] text-ink">{category}</span>
      </div>

      {typeof totalResponses === 'number' && (
        <span className="text-xs text-ink-muted mt-2">
          Based on {totalResponses} team {totalResponses === 1 ? 'response' : 'responses'}
        </span>
      )}
    </div>
  );
};
