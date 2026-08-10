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
          <div className="space-y-3">
            {/* Input Guide Reference Card */}
            <div className="p-3.5 bg-surface-raised border border-borderCustom rounded-lg text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 font-mono text-accent-dark font-semibold">
                <span>💡 Helpful Reference Examples</span>
              </div>
              <p className="text-ink-muted leading-relaxed">
                Think of a repetitive task in your weekly workflow. Here are a few general ideas across departments:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 bg-surface border border-borderCustom/60 rounded text-[11px] text-ink flex items-start gap-1.5">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Engineering / Tech:</strong> Summarizing meeting action items & updating Jira tickets</span>
                </div>
                <div className="p-2 bg-surface border border-borderCustom/60 rounded text-[11px] text-ink flex items-start gap-1.5">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Legal / Ops:</strong> Reviewing contract clauses against compliance policies</span>
                </div>
                <div className="p-2 bg-surface border border-borderCustom/60 rounded text-[11px] text-ink flex items-start gap-1.5">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Sales / Marketing:</strong> Drafting personalized outreach emails from prospect data</span>
                </div>
                <div className="p-2 bg-surface border border-borderCustom/60 rounded text-[11px] text-ink flex items-start gap-1.5">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Finance / Admin:</strong> Extracting line items from vendor PDF invoices</span>
                </div>
              </div>
            </div>

            <textarea
              rows={3}
              value={selectedValue || ''}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="Describe your routine work task here..."
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
