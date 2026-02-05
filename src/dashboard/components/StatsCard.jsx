// src/dashboard/components/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatsCard({ icon: Icon, value, label, color = 'orange', trend, trendDirection }) {
  const colorClasses = {
    orange: 'from-orange-500 to-orange-600',
    green: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={24} strokeWidth={1.8} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
              trendDirection === 'up'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {trendDirection === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default StatsCard;