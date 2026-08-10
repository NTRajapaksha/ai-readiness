import React from 'react';

interface LikertInputProps {
  labels: readonly string[];
  selectedValue: number | null; // 1 to 5
  onChange: (value: number) => void;
}

export const LikertInput: React.FC<LikertInputProps> = ({ labels, selectedValue, onChange }) => {
  const minLabel = labels[0];
  const maxLabel = labels[labels.length - 1];

  return (
    <div className="space-y-3">
      {/* Segmented Control Bar */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-surface border border-borderCustom rounded-xl">
        {labels.map((label, index) => {
          const value = index + 1;
          const isSelected = selectedValue === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`py-3 sm:py-3.5 px-1 rounded-lg flex flex-col items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isSelected
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : 'bg-surface-raised text-ink hover:bg-surface border border-borderCustom/50'
              }`}
            >
              <span className="font-mono text-sm sm:text-base font-semibold">{value}</span>
              <span
                className={`text-[9px] sm:text-[11px] text-center leading-tight mt-0.5 block truncate max-w-full px-0.5 ${
                  isSelected ? 'text-white/90 font-medium' : 'text-ink-muted'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clear Scale Min / Max Endpoint Guide */}
      <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted px-1">
        <span>1 = {minLabel}</span>
        <span>5 = {maxLabel}</span>
      </div>

      {/* Selected Label Banner */}
      {selectedValue !== null && (
        <div className="p-2 bg-surface-raised border border-borderCustom rounded-lg text-center text-xs font-mono text-ink">
          Selected ({selectedValue}): <span className="font-bold text-accent">{labels[selectedValue - 1]}</span>
        </div>
      )}
    </div>
  );
};
