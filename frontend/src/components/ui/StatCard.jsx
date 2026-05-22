/**
 * Metric card — clean white card with colored icon, value, label, and trend badge.
 * Used across the dashboard to display key performance indicators.
 */

import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = '#16a34a', trend, trendValue, delay = 0 }) {
  return (
    <div
      className="metric-card animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon + Trend row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </div>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {trend === 'up'
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-[1.625rem] font-bold text-gray-900 dark:text-white tracking-tight leading-none">
        {value}
      </p>

      {/* Label */}
      <p className="text-[0.8125rem] text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
        {title}
      </p>
    </div>
  );
}
