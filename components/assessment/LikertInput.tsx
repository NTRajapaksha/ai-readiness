import React from 'react';

interface LikertInputProps {
  labels: readonly string[];
  selectedValue: number | null; // 1 to 5
  onChange: (value: number) => void;
}

export const LikertInput: React.FC<LikertInputProps> = ({ labels, selectedValue, onChange }) => {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 p-1.5 bg-surface border border-borderCustom rounded-xl w-full">
      {labels.map((label, index) => {
        const value = index + 1;
        const isSelected = selectedValue === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`py-3 sm:py-4 px-1 rounded-lg flex flex-col items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isSelected
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'bg-surface-raised text-ink hover:bg-surface border border-borderCustom/60 hover:border-accent/40'
            }`}
          >
            <span className="font-mono text-sm sm:text-base font-bold mb-0.5">{value}</span>
            <span
              className={`text-[10px] sm:text-xs text-center leading-tight block px-0.5 ${
                isSelected ? 'text-white/95 font-medium' : 'text-ink-muted'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
