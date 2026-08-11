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
    <div className="p-6 bg-surface border border-borderCustom rounded-lg w-full">
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
            <div key={team} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase font-semibold text-ink sm:text-base">
                    {team}
                  </span>

                  {/* Category Pill Tag matching ScoreGauge visual style */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-raised border border-borderCustom rounded-full">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="data-label text-[10px] sm:text-xs text-ink">{category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-ink-muted text-xs sm:text-sm">
                    {responseCount} {responseCount === 1 ? 'member' : 'members'}
                  </span>
                  <span className="font-mono font-semibold text-ink sm:text-base">
                    {overall}/100
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-3 w-full bg-borderCustom rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${overall}%`, backgroundColor: color }}
                />
              </div>

              {/* Mini dimension metrics */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-ink-muted font-mono pt-1">
                <div>Fluency: <span className="text-ink font-semibold">{dims.fluency}</span></div>
                <div>Integration: <span className="text-ink font-semibold">{dims.integration}</span></div>
                <div>Culture: <span className="text-ink font-semibold">{dims.culture}</span></div>
                <div>Risk: <span className="text-ink font-semibold">{dims.risk}</span></div>
                <div>Leadership: <span className="text-ink font-semibold">{dims.leadership || 0}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
