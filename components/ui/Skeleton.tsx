import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-borderCustom">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-borderCustom rounded" />
          <div className="h-8 w-64 bg-borderCustom rounded" />
        </div>
        <div className="h-10 w-36 bg-borderCustom rounded" />
      </div>

      {/* Hero Analytics Row (Gauge Block + Radar/Bar Block) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circular Gauge-shaped Skeleton Block */}
        <div className="p-6 bg-surface border border-borderCustom rounded-lg flex flex-col items-center justify-center space-y-4">
          <div className="h-3 w-32 bg-borderCustom rounded" />
          <div className="w-44 h-44 rounded-full border-8 border-borderCustom flex items-center justify-center">
            <div className="h-8 w-16 bg-borderCustom rounded" />
          </div>
          <div className="h-6 w-24 bg-borderCustom rounded-full" />
        </div>

        {/* Chart-shaped Skeleton Block */}
        <div className="md:col-span-2 p-6 bg-surface border border-borderCustom rounded-lg space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-3 w-40 bg-borderCustom rounded" />
            <div className="h-3 w-16 bg-borderCustom rounded" />
          </div>
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-borderCustom rounded" />
                  <div className="h-3 w-12 bg-borderCustom rounded" />
                </div>
                <div className="h-3 w-full bg-borderCustom rounded-full" />
              </div>
            ))}
          </div>
          <div className="h-3 w-48 bg-borderCustom rounded self-end" />
        </div>
      </div>

      {/* Recommendations Section Skeleton (3 Card Blocks) */}
      <div className="space-y-4">
        <div className="h-4 w-48 bg-borderCustom rounded" />

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 bg-surface border border-borderCustom rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-64 bg-borderCustom rounded" />
                <div className="h-4 w-16 bg-borderCustom rounded-full" />
              </div>
              <div className="h-3 w-full bg-borderCustom rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
