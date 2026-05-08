'use client';

// components/trust/TrustCard.js — Expanded trust view for supplier profiles

import TrustBadge from './TrustBadge';

export default function TrustCard({ trustScore, trustBreakdown, trustBadge, responseTime, profileCompletion }) {
  const scoreColor = trustScore >= 70 ? 'text-emerald-600' : trustScore >= 40 ? 'text-amber-600' : 'text-gray-500';
  const barColor = trustScore >= 70 ? 'bg-emerald-500' : trustScore >= 40 ? 'bg-amber-500' : 'bg-gray-400';

  const breakdownItems = [
    { label: 'Profile', value: trustBreakdown?.profileCompleteness || 0, icon: '👤' },
    { label: 'Verification', value: trustBreakdown?.verificationStatus || 0, icon: '✓' },
    { label: 'Response Rate', value: trustBreakdown?.responseRate || 0, icon: '💬' },
    { label: 'Product Quality', value: trustBreakdown?.productQuality || 0, icon: '📦' },
    { label: 'Activity', value: trustBreakdown?.activityRecency || 0, icon: '⚡' },
    { label: 'Account Age', value: trustBreakdown?.accountAge || 0, icon: '📅' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Trust Score</h3>
        <TrustBadge badge={trustBadge} size="md" />
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className={`text-4xl font-black ${scoreColor}`}>{trustScore}</span>
        <span className="text-sm text-gray-500">/100</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-6 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${trustScore}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-6">
        {breakdownItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-sm w-5 text-center">{item.icon}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 min-w-0">{item.label}</span>
            <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.value >= 70 ? 'bg-emerald-500' : item.value >= 40 ? 'bg-amber-500' : 'bg-gray-400'
                }`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Response Time */}
      {responseTime && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              responseTime.speed === 'fast' ? 'bg-emerald-500' : responseTime.speed === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{responseTime.label}</span>
          </div>
        </div>
      )}

      {/* Profile Completion */}
      {profileCompletion && profileCompletion.percentage < 100 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Completion</span>
            <span className="text-sm font-bold text-orange-600">{profileCompletion.percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${profileCompletion.percentage}%` }}
            />
          </div>
          <ul className="space-y-1">
            {profileCompletion.steps.filter((s) => !s.completed).slice(0, 3).map((step) => (
              <li key={step.key} className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-400" />
                {step.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
