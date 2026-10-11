import React from 'react';
import { Skeleton } from '../common/Skeleton';

export interface StatusCounts {
  booked: number;
  inTransit: number;
  customsHold: number;
  delivered: number;
}

export interface StatusDonutChartProps {
  statusCounts: StatusCounts;
  isLoading?: boolean;
}

interface SegmentConfig {
  key: keyof StatusCounts;
  label: string;
  color: string;
  dotColor: string;
}

const SEGMENTS: SegmentConfig[] = [
  { key: 'booked', label: 'Booked', color: '#627D98', dotColor: 'bg-[#627D98]' },
  { key: 'inTransit', label: 'In Transit', color: '#245A91', dotColor: 'bg-[#245A91]' },
  { key: 'customsHold', label: 'Customs Hold', color: '#D97706', dotColor: 'bg-[#D97706]' },
  { key: 'delivered', label: 'Delivered', color: '#16A34A', dotColor: 'bg-[#16A34A]' },
];

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  statusCounts,
  isLoading = false,
}) => {
  const total =
    statusCounts.booked +
    statusCounts.inTransit +
    statusCounts.customsHold +
    statusCounts.delivered;

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4"
        aria-busy="true"
        aria-label="Loading shipment status distribution"
      >
        <Skeleton className="w-32 h-5 rounded" />
        <div className="flex justify-center py-4">
          <Skeleton className="w-36 h-36 rounded-full" />
        </div>
        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-full h-4 rounded" />
        </div>
      </div>
    );
  }

  // SVG Donut geometry: Uses native circle stroke-dasharray and stroke-dashoffset to render
  // proportional arc segments without pulling in heavyweight external charting libraries.
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke-dasharray and offsets for segments based on proportion of total shipments
  let cumulativeOffset = 0;
  const renderedSegments = SEGMENTS.map((segment) => {
    const value = statusCounts[segment.key] ?? 0;
    const ratio = total > 0 ? value / total : 0;
    const strokeDash = ratio * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += strokeDash;

    return {
      ...segment,
      value,
      strokeDash,
      offset,
    };
  });

  const accessibleSummary = `Shipment status breakdown: ${SEGMENTS.map(
    (s) => `${s.label}: ${statusCounts[s.key]}`
  ).join(', ')}. Total: ${total} shipments.`;

  return (
    <div className="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-base font-semibold text-ink-primary">Shipment status</h2>
        <span className="text-xs text-ink-muted font-mono">{total} total</span>
      </div>

      {/* Donut graphic */}
      <div className="my-auto py-4 flex flex-col items-center justify-center">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-6 px-2">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="mb-2"
              role="img"
              aria-label="Neutral empty status donut"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold font-mono fill-ink-muted"
              >
                0
              </text>
              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-medium uppercase tracking-wider fill-ink-muted"
              >
                Total
              </text>
            </svg>
            <p className="text-xs text-ink-muted mt-1">No shipment data available</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={accessibleSummary}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {renderedSegments.map(
                (seg) =>
                  seg.value > 0 && (
                    <circle
                      key={seg.key}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${seg.strokeDash} ${circumference - seg.strokeDash}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                    />
                  )
              )}
            </svg>

            {/* Centered label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-bold font-mono text-ink-primary leading-none">
                {total}
              </span>
              <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider mt-0.5">
                Total
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Accessible description for screen readers */}
      <span className="sr-only">{accessibleSummary}</span>

      {/* Legend list */}
      <ul
        className="pt-3 border-t border-border-subtle divide-y divide-border-subtle/50 text-xs"
        aria-label="Shipment status counts legend"
      >
        {SEGMENTS.map((seg) => {
          const count = statusCounts[seg.key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li
              key={seg.key}
              className="py-1.5 flex items-center justify-between text-ink-secondary"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${seg.dotColor}`}
                  aria-hidden="true"
                />
                <span className="font-medium truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-ink-primary">
                <span className="font-semibold">{count}</span>
                <span className="text-[10px] text-ink-muted">({pct}%)</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
