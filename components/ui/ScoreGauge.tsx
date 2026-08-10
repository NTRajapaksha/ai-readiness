'use client';

import React, { useEffect, useState } from 'react';
import { getScoreCategory, getScoreColor } from '@/lib/scoring';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  totalResponses?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, totalResponses }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Shared color & category utilities from lib/scoring.ts
  const strokeColor = getScoreColor(score);
  const category = getScoreCategory(score);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;
    const duration = 1200; // 1.2s ease-out

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quadratic
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      setDisplayScore(Math.round(easeProgress * score));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [score]);

  // SVG Geometry
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between p-5 sm:p-6 bg-surface border border-borderCustom rounded-lg text-center h-full min-h-[380px] max-h-[420px]">
      <span className="data-label mb-2">Overall AI Readiness</span>

      <div className="relative w-[180px] h-[180px] flex items-center justify-center my-auto">
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

      <div className="space-y-1 mt-2">
        {/* Category Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-raised border border-borderCustom rounded-full">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
          <span className="data-label text-[11px] text-ink">{category}</span>
        </div>

        {typeof totalResponses === 'number' && (
          <div className="text-xs text-ink-muted block">
            Based on {totalResponses} team {totalResponses === 1 ? 'response' : 'responses'}
          </div>
        )}
      </div>
    </div>
  );
};
