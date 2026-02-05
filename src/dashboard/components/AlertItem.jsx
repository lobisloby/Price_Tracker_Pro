// src/dashboard/components/AlertItem.jsx
import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  ExternalLink,
  X
} from 'lucide-react';

function AlertItem({ alert, onDelete }) {
  const isPriceDrop = alert.type === 'price_drop';
  
  // Format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        isPriceDrop 
          ? 'bg-emerald-100 text-emerald-600' 
          : 'bg-red-100 text-red-600'
      }`}>
        {isPriceDrop ? (
          <TrendingDown size={24} strokeWidth={2} />
        ) : (
          <TrendingUp size={24} strokeWidth={2} />
        )}
      </div>
      
      {/* Product Image (if available) */}
      {alert.image && (
        <a 
          href={alert.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <img 
            src={alert.image} 
            alt="" 
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            onError={(e) => e.target.style.display = 'none'}
          />
        </a>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={alert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-800 hover:text-orange-500 transition-colors line-clamp-1 block"
        >
          {alert.productTitle}
        </a>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="text-gray-400 line-through">
            {alert.currency}{alert.oldPrice?.toFixed(2)}
          </span>
          <span className="text-gray-400">→</span>
          <span className={`font-semibold ${isPriceDrop ? 'text-emerald-500' : 'text-red-500'}`}>
            {alert.currency}{alert.newPrice?.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Savings & Time */}
      <div className="text-right shrink-0">
        <div className={`text-sm font-bold flex items-center justify-end gap-1 ${isPriceDrop ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPriceDrop ? (
            <TrendingDown size={14} />
          ) : (
            <TrendingUp size={14} />
          )}
          {alert.savings}%
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {getTimeAgo(alert.time)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={alert.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-orange-100 rounded-lg transition-colors text-gray-400 hover:text-orange-500"
          title="View product"
        >
          <ExternalLink size={16} />
        </a>
        {onDelete && (
          <button
            onClick={() => onDelete(alert.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            title="Delete alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default AlertItem;