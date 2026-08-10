'use client';

import React from 'react';
import { DimensionScores } from '@/types';

interface RadarChartProps {
  dimensionScores: DimensionScores;
}

export const RadarChart: React.FC<RadarChartProps> = ({ dimensionScores }) => {
  // SVG Radar Dimensions with ample padding for full labels
  const viewBoxWidth = 400;
  const viewBoxHeight = 320;
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;
  const radius = 75;

  const keys: (keyof DimensionScores)[] = ['fluency', 'integration', 'culture', 'risk', 'leadership'];
  const total = keys.length;

  const LABELS: Record<keyof DimensionScores, string> = {
    fluency: 'Tool Fluency',
    integration: 'Integration',
    culture: 'Shared AI Culture',
    risk: 'Risk & Governance',
    leadership: 'Leadership Buy-In',
  };

  // Compute (x, y) coordinates for each axis
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Grid concentric polygons (25%, 50%, 75%, 100%)
  const gridRatios = [0.25, 0.5, 0.75, 1.0];

  const gridPoints = gridRatios.map((ratio) =>
    keys
      .map((_, i) => {
        const { x, y } = getCoordinates(i, ratio);
        return `${x},${y}`;
      })
      .join(' ')
  );

  // Data polygon points
  const dataPoints = keys
    .map((key, i) => {
      const val = (dimensionScores[key] || 0) / 100;
      const { x, y } = getCoordinates(i, Math.max(0.05, val));
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface border border-borderCustom rounded-lg w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="data-label">Org Readiness Radar</span>
        <span className="text-xs text-ink-muted font-mono">5 Dimensions</span>
      </div>

      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
          {/* Concentric Grid Lines */}
          {gridPoints.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="#E2E0D8"
              strokeWidth="1"
            />
          ))}

          {/* Axes Lines */}
          {keys.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#E2E0D8"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Data Polygon */}
          <polygon
            points={dataPoints}
            fill="#2A6F6F"
            fillOpacity="0.2"
            stroke="#2A6F6F"
            strokeWidth="2"
          />

          {/* Data Points */}
          {keys.map((key, i) => {
            const val = (dimensionScores[key] || 0) / 100;
            const { x, y } = getCoordinates(i, Math.max(0.05, val));
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#2A6F6F"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Category Axis Labels */}
          {keys.map((key, i) => {
            const { x, y } = getCoordinates(i, 1.25);
            const score = dimensionScores[key] || 0;
            let textAnchor: 'middle' | 'end' | 'start' = 'middle';
            if (x < centerX - 15) textAnchor = 'end';
            if (x > centerX + 15) textAnchor = 'start';

            return (
              <g key={`label-${i}`}>
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill="#1C2333"
                  className="font-mono text-[10px] font-semibold uppercase"
                  dominantBaseline="middle"
                >
                  {LABELS[key]}
                </text>
                <text
                  x={x}
                  y={y + 12}
                  textAnchor={textAnchor}
                  fill="#5B6472"
                  className="font-mono text-[9px]"
                  dominantBaseline="middle"
                >
                  {score}/100
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
