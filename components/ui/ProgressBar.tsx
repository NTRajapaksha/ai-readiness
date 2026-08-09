import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-borderCustom z-50 overflow-hidden">
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `${clampedProgress}%` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};
