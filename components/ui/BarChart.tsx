'use client';

import React, { useState } from 'react';
import { DimensionScores } from '@/types';
import { calculateOverallScore, getScoreCategory, getScoreColor } from '@/lib/scoring';

interface BarChartProps {
  teamScores: Record<string, DimensionScores>;
  responsesByTeam: Record<string, number>;
}

export const BarChart: React.FC<BarChartProps> = ({ teamScores, responsesByTeam }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'lagging' | 'leading'>('all');

  const rawTeams = Object.keys(teamScores);

  if (rawTeams.length === 0) return null;

  // Sort teams ascending by score (teams needing attention surface first)
  const sortedTeams = [...rawTeams].sort((a, b) => {
    const scoreA = calculateOverallScore(teamScores[a]);
    const scoreB = calculateOverallScore(teamScores[b]);
    return scoreA - scoreB;
  });

  // Filter teams based on active tab
  let displayedTeams = sortedTeams;
  if (activeTab === 'lagging') {
    displayedTeams = sortedTeams.slice(0, Math.ceil(sortedTeams.length / 2));
  } else if (activeTab === 'leading') {
    displayedTeams = [...sortedTeams].reverse().slice(0, Math.floor(sortedTeams.length / 2));
  }

  const isManyTeams = sortedTeams.length > 4;

  return (
    <div className="p-5 sm:p-6 bg-surface border border-borderCustom rounded-lg w-full h-full min-h-[380px] flex flex-col justify-between overflow-hidden">
      {/* Header Bar with View Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div>
          <span className="data-label">Team Breakdown</span>
          <span className="text-[11px] text-ink-muted font-mono ml-2">({sortedTeams.length} Total)</span>
        </div>

        {/* Executive View Tabs (Only show if > 4 teams) */}
        {isManyTeams && (
          <div className="inline-flex items-center gap-1 p-0.5 bg-surface-raised border border-borderCustom rounded-md self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-accent text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('lagging')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                activeTab === 'lagging'
                  ? 'bg-taiCoral text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Needs Support
            </button>
            <button
              onClick={() => setActiveTab('leading')}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                activeTab === 'leading'
                  ? 'bg-taiViolet text-white font-semibold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Top Performers
            </button>
          </div>
        )}
      </div>

      {/* Team Cards Container — 100% Hidden Scrollbar + Smooth Touch/Wheel Scroll */}
      <div className="space-y-3 overflow-y-auto max-h-[310px] pr-0.5 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className={isManyTeams && activeTab === 'all' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
          {displayedTeams.map((team) => {
            const dims = teamScores[team];
            const overall = calculateOverallScore(dims);
            const responseCount = responsesByTeam[team] || 0;
            const color = getScoreColor(overall);
            const category = getScoreCategory(overall);

            return (
              <div
                key={team}
                className="p-3 bg-surface-raised/70 border border-borderCustom/60 rounded-lg space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono uppercase font-semibold text-ink truncate text-[11px]">
                      {team}
                    </span>

                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface border border-borderCustom rounded-full flex-shrink-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="data-label text-[8px] text-ink">{category}</span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-ink text-xs flex-shrink-0">
                    {overall}<span className="text-[10px] text-ink-muted font-normal">/100</span>
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="h-2 w-full bg-borderCustom/70 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${overall}%`, backgroundColor: color }}
                  />
                </div>

                {/* Compact Mini Dimension Metrics */}
                <div className="flex flex-wrap items-center justify-between text-[9px] text-ink-muted font-mono pt-0.5">
                  <span>Flu: <strong className="text-ink">{dims.fluency}</strong></span>
                  <span>Int: <strong className="text-ink">{dims.integration}</strong></span>
                  <span>Cul: <strong className="text-ink">{dims.culture}</strong></span>
                  <span>Rsk: <strong className="text-ink">{dims.risk}</strong></span>
                  <span>Ldr: <strong className="text-ink">{dims.leadership || 0}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
