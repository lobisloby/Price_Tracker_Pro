// src/dashboard/pages/Alerts.jsx
import React, { useState } from 'react';
import {
  Bell,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Trash2,
  AlertTriangle,
  BellOff,
  Loader2
} from 'lucide-react';
import AlertItem from '../components/AlertItem';
import { useAlerts } from '../hooks/useAlerts';

function Alerts() {
  const { 
    alerts, 
    loading, 
    groupedAlerts, 
    totalSavings, 
    totalAlerts,
    clearAlerts, 
    deleteAlert,
    refresh 
  } = useAlerts();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, week

  // Handle clear all
  const handleClearAll = async () => {
    const result = await clearAlerts();
    if (result.success) {
      setShowClearConfirm(false);
    }
  };

  // Handle delete single alert
  const handleDelete = async (alertId) => {
    await deleteAlert(alertId);
  };

  // Filter alerts
  const getFilteredAlerts = () => {
    switch (filter) {
      case 'today':
        return groupedAlerts.today;
      case 'week':
        return [...groupedAlerts.today, ...groupedAlerts.yesterday, ...groupedAlerts.thisWeek];
      default:
        return alerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalAlerts}</p>
              <p className="text-sm text-gray-500">Total Alerts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{groupedAlerts.today.length}</p>
              <p className="text-sm text-gray-500">Today's Drops</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">${totalSavings}</p>
              <p className="text-sm text-gray-500">Total Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'today' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'week' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          {alerts.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Clear All Alerts?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all {alerts.length} alerts. 
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <div className="text-center text-gray-400">
            <Loader2 size={40} className="animate-spin mx-auto mb-4 text-orange-500" />
            Loading alerts...
          </div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <div className="text-center">
            <BellOff size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No alerts yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              When prices drop on your tracked products, you'll see alerts here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today */}
          {filter === 'all' && groupedAlerts.today.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Today
              </h3>
              <div className="space-y-3">
                {groupedAlerts.today.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {filter === 'all' && groupedAlerts.yesterday.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Yesterday
              </h3>
              <div className="space-y-3">
                {groupedAlerts.yesterday.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {filter === 'all' && groupedAlerts.thisWeek.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                {groupedAlerts.thisWeek.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {filter === 'all' && groupedAlerts.older.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Older
              </h3>
              <div className="space-y-3">
                {groupedAlerts.older.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Filtered view (Today or Week) */}
          {filter !== 'all' && (
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="space-y-3">
                {filteredAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Alerts;