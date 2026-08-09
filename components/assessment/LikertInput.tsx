import React from 'react';

interface LikertInputProps {
  labels: readonly string[];
  selectedValue: number | null; // 1 to 5
  onChange: (value: number) => void;
}

export const LikertInput: React.FC<LikertInputProps> = ({ labels, selectedValue, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Segmented Control Bar */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-surface border border-borderCustom rounded-lg">
        {labels.map((label, index) => {
          const value = index + 1;
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`py-3 sm:py-4 px-1 rounded flex flex-col items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised text-ink hover:bg-surface border border-borderCustom/50'
              }`}
            >
              <span className="font-mono text-sm sm:text-base mb-0.5">{value}</span>
              <span
                className={`text-[10px] sm:text-xs text-center leading-tight hidden sm:block ${
                  isSelected ? 'text-white' : 'text-ink-muted'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Label indicator on mobile screens */}
      {selectedValue !== null && (
        <div className="sm:hidden text-center text-xs text-ink-muted font-medium">
          Selected: <span className="text-ink">{labels[selectedValue - 1]}</span>
        </div>
      )}
    </div>
  );
};
