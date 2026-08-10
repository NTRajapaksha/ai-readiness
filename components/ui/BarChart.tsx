import React from 'react';
import { DimensionScores } from '@/types';
import { calculateOverallScore, getScoreCategory, getScoreColor } from '@/lib/scoring';

interface BarChartProps {
  teamScores: Record<string, DimensionScores>;
  responsesByTeam: Record<string, number>;
}

export const BarChart: React.FC<BarChartProps> = ({ teamScores, responsesByTeam }) => {
  const rawTeams = Object.keys(teamScores);

  if (rawTeams.length === 0) return null;

  // Sort teams ascending by score (teams needing attention surface first)
  const teams = [...rawTeams].sort((a, b) => {
    const scoreA = calculateOverallScore(teamScores[a]);
    const scoreB = calculateOverallScore(teamScores[b]);
    return scoreA - scoreB;
  });

  return (
    <div className="p-6 bg-surface border border-borderCustom rounded-lg w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="data-label">Team Performance Breakdown</span>
        <span className="text-xs text-ink-muted font-mono">{teams.length} Teams</span>
      </div>

      <div className="space-y-5">
        {teams.map((team) => {
          const dims = teamScores[team];
          const overall = calculateOverallScore(dims);
          const responseCount = responsesByTeam[team] || 0;
          const color = getScoreColor(overall);
          const category = getScoreCategory(overall);

          return (
            <div key={team} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase font-semibold text-ink">
                    {team}
                  </span>

                  {/* Category Pill Tag matching ScoreGauge visual style */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-raised border border-borderCustom rounded-full">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="data-label text-[9px] text-ink">{category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-ink-muted text-[11px]">
                    {responseCount} {responseCount === 1 ? 'member' : 'members'}
                  </span>
                  <span className="font-mono font-semibold text-ink">
                    {overall}/100
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-2.5 w-full bg-borderCustom rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${overall}%`, backgroundColor: color }}
                />
              </div>

              {/* Mini dimension metrics */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted font-mono pt-0.5">
                <div>Fluency: <span className="text-ink">{dims.fluency}</span></div>
                <div>Integration: <span className="text-ink">{dims.integration}</span></div>
                <div>Culture: <span className="text-ink">{dims.culture}</span></div>
                <div>Risk: <span className="text-ink">{dims.risk}</span></div>
                <div>Leadership: <span className="text-ink">{dims.leadership || 0}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
