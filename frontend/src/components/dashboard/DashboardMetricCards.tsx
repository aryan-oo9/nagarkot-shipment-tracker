import React from 'react';
import { Calendar, CalendarRange, Globe, Truck } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

export interface DashboardMetricCardsProps {
  thisMonth: number;
  thisYear: number;
  domestic: number;
  international: number;
  isLoading?: boolean;
}

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({
  thisMonth,
  thisYear,
  domestic,
  international,
  isLoading = false,
}) => {
  const cards = [
    {
      id: 'this-month',
      label: 'This month',
      count: thisMonth,
      supportingText: 'Shipments created',
      icon: Calendar,
      colorClasses: {
        iconBg: 'bg-blue-50 text-blue-700',
        cardHover: 'hover:border-blue-200',
        accentBg: 'from-blue-50/20 to-transparent',
      },
    },
    {
      id: 'this-year',
      label: 'This year',
      count: thisYear,
      supportingText: 'Shipments created',
      icon: CalendarRange,
      colorClasses: {
        iconBg: 'bg-emerald-50 text-emerald-700',
        cardHover: 'hover:border-emerald-200',
        accentBg: 'from-emerald-50/20 to-transparent',
      },
    },
    {
      id: 'domestic',
      label: 'Domestic',
      count: domestic,
      supportingText: 'Total shipments',
      icon: Truck,
      colorClasses: {
        iconBg: 'bg-purple-50 text-purple-700',
        cardHover: 'hover:border-purple-200',
        accentBg: 'from-purple-50/20 to-transparent',
      },
    },
    {
      id: 'international',
      label: 'International',
      count: international,
      supportingText: 'Total shipments',
      icon: Globe,
      colorClasses: {
        iconBg: 'bg-amber-50 text-amber-700',
        cardHover: 'hover:border-amber-200',
        accentBg: 'from-amber-50/20 to-transparent',
      },
    },
  ];

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-busy="true"
        aria-label="Loading summary metrics"
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-surface rounded-lg border border-border-subtle p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="w-20 h-3 rounded" />
            </div>
            <Skeleton className="w-16 h-8 rounded" />
            <Skeleton className="w-28 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Logistics summary metrics"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`
              bg-surface bg-gradient-to-br ${card.colorClasses.accentBg}
              rounded-lg border border-border-subtle p-5 shadow-xs
              flex flex-col justify-between transition-colors
              ${card.colorClasses.cardHover}
            `}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${card.colorClasses.iconBg}`}
                aria-hidden="true"
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                {card.label}
              </span>
            </div>

            <div className="mt-4">
              <div
                className="text-2xl sm:text-3xl font-bold font-mono text-ink-primary tracking-tight"
                aria-label={`${card.label}: ${card.count}`}
              >
                {card.count}
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">
                {card.supportingText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
