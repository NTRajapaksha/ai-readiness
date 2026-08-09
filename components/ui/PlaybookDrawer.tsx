'use client';

import React from 'react';
import { Recommendation } from '@/types';
import { DIMENSION_LABELS } from '@/lib/questions';

interface PlaybookDrawerProps {
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const PlaybookDrawer: React.FC<PlaybookDrawerProps> = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm fade-in-quiet">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-bg border-l border-borderCustom h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between z-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-borderCustom">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-accent-light text-accent-dark rounded text-[10px] font-mono font-semibold uppercase">
                  {DIMENSION_LABELS[recommendation.dimension]}
                </span>
                {recommendation.targetTeam && (
                  <span className="px-2 py-0.5 bg-surface border border-borderCustom text-ink rounded text-[10px] font-mono font-semibold uppercase">
                    {recommendation.targetTeam}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-serif font-semibold text-ink leading-snug">
                {recommendation.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-ink-muted hover:text-ink text-xl font-mono leading-none rounded focus-visible:outline-none"
              aria-label="Close playbook"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <div className="p-4 bg-surface border border-borderCustom rounded-lg text-xs sm:text-sm text-ink-muted leading-relaxed">
            {recommendation.description}
          </div>

          {/* 3-Week Execution Playbook */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="data-label">Tai Labs Coaching Playbook</span>
              <span className="text-[10px] font-mono text-ink-muted">3-Week Action Plan</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-borderCustom">
              {recommendation.playbook.map((step, idx) => (
                <div key={idx} className="relative pl-8 space-y-1">
                  <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-mono font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent-dark font-semibold">
                      {step.week}
                    </span>
                    <span className="font-sans font-semibold text-sm text-ink">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {step.action}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 p-2 bg-surface-raised border border-borderCustom rounded text-[11px] text-ink font-mono max-w-full overflow-hidden break-words">
                    <span className="text-accent font-bold">Deliverable:</span> <span className="break-words">{step.deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-borderCustom flex justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark transition-colors focus-visible:outline-none"
          >
            Close Playbook
          </button>
        </div>
      </div>
    </div>
  );
};
