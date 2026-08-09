import React from 'react';
import { Question } from '@/types';
import { DIMENSION_LABELS } from '@/lib/questions';
import { LikertInput } from './LikertInput';
import { MultipleChoiceInput } from './MultipleChoiceInput';

interface QuestionCardProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  selectedValue: any;
  onAnswer: (val: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentStep,
  totalSteps,
  selectedValue,
  onAnswer,
  onNext,
  onPrev,
}) => {
  const isLikert = question.type === 'likert';
  const isMC = question.type === 'multiple_choice';
  const isText = question.type === 'text_optional';

  const canProceed = isText || selectedValue !== null;

  return (
    <div className="w-full max-w-[560px] mx-auto space-y-6 fade-in-quiet">
      {/* Top Header metadata */}
      <div className="flex items-center justify-between">
        <span className="data-label text-accent-dark">
          {DIMENSION_LABELS[question.dimension]}
        </span>
        <span className="text-xs font-mono text-ink-muted">
          Question {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-xl sm:text-2xl font-sans font-semibold text-ink leading-snug">
        {question.text}
      </h2>

      {/* Input controls based on type */}
      <div className="pt-2">
        {isLikert && question.labels && (
          <LikertInput
            labels={question.labels}
            selectedValue={selectedValue}
            onChange={(val) => onAnswer(val)}
          />
        )}

        {isMC && question.options && (
          <MultipleChoiceInput
            options={question.options}
            selectedIndex={selectedValue}
            onChange={(idx) => onAnswer(idx)}
          />
        )}

        {isText && (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={selectedValue || ''}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="e.g. Extracting key insights from 50-page vendor PDF files..."
              className="w-full p-4 text-sm bg-surface-raised border border-borderCustom rounded-lg text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
            />
            <p className="text-xs text-ink-muted">Optional: Press next to skip if you have no specific task.</p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-borderCustom">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentStep === 1}
          className="text-xs font-mono uppercase tracking-wider text-ink-muted hover:text-ink disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {currentStep === totalSteps ? 'See your results' : 'Next question →'}
        </button>
      </div>
    </div>
  );
};
