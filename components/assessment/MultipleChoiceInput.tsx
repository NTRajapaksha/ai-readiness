import React from 'react';

interface MultipleChoiceInputProps {
  options: readonly string[];
  selectedIndex: number | null;
  onChange: (index: number) => void;
}

export const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
  options,
  selectedIndex,
  onChange,
}) => {
  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            className={`w-full text-left p-4 rounded-lg border text-sm transition-colors duration-150 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isSelected
                ? 'bg-accent-light border-accent text-accent-dark font-medium'
                : 'bg-surface-raised border-borderCustom text-ink hover:bg-surface'
            }`}
          >
            <span>{option}</span>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'border-accent bg-accent' : 'border-borderCustom bg-surface-raised'
              }`}
            >
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
