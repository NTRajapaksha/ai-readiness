import React from 'react';
import { DimensionScores } from '@/types';
import { calculateOverallScore } from '@/lib/scoring';

interface BarChartProps {
  teamScores: Record<string, DimensionScores>;
  responsesByTeam: Record<string, number>;
}

export const BarChart: React.FC<BarChartProps> = ({ teamScores, responsesByTeam }) => {
  const teams = Object.keys(teamScores);

  if (teams.length === 0) return null;

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

          // Bar color based on monochrome score scale
          let barColor = 'bg-[#C9D6D6]';
          if (overall >= 40 && overall < 70) {
            barColor = 'bg-[#6FA3A3]';
          } else if (overall >= 70) {
            barColor = 'bg-[#2A6F6F]';
          }

          return (
            <div key={team} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase font-semibold text-ink">
                  {team}
                </span>
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
                  className={`h-full ${barColor} transition-all duration-500 ease-out`}
                  style={{ width: `${overall}%` }}
                />
              </div>

              {/* Mini dimension pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted font-mono pt-0.5">
                <div>Fluency: <span className="text-ink">{dims.fluency}</span></div>
                <div>Integration: <span className="text-ink">{dims.integration}</span></div>
                <div>Culture: <span className="text-ink">{dims.culture}</span></div>
                <div>Risk: <span className="text-ink">{dims.risk}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
