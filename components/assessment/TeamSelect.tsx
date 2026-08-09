import React from 'react';
import { TEAMS } from '@/lib/questions';

interface TeamSelectProps {
  selectedTeam: string;
  onSelectTeam: (team: string) => void;
}

export const TeamSelect: React.FC<TeamSelectProps> = ({ selectedTeam, onSelectTeam }) => {
  return (
    <div className="space-y-3">
      <label className="data-label block">Select Your Department</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TEAMS.map((team) => {
          const isSelected = selectedTeam === team;
          return (
            <button
              key={team}
              type="button"
              onClick={() => onSelectTeam(team)}
              className={`p-3 text-xs sm:text-sm font-medium rounded-lg border text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface-raised border-borderCustom text-ink hover:bg-surface'
              }`}
            >
              {team}
            </button>
          );
        })}
      </div>
    </div>
  );
};
