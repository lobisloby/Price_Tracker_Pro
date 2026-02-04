// src/dashboard/hooks/useStats.js
// ✅ Updated with storage change listener for auto-updates

import { useState, useEffect, useCallback } from 'react';

export function useStats() {
  const [stats, setStats] = useState({
    totalTracked: 0,
    totalPriceDrops: 0,
    totalSaved: 0,
    recentDrops: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['stats', 'products', 'alerts']);
        
        // Count recent drops (last 24 hours)
        const recentDrops = (result.alerts || []).filter(alert => {
          const alertTime = new Date(alert.time);
          const hoursSince = (new Date() - alertTime) / (1000 * 60 * 60);
          return hoursSince < 24 && alert.type === 'price_drop';
        }).length;

        const newStats = {
          totalTracked: result.products?.length || 0,
          totalPriceDrops: result.stats?.totalPriceDrops || result.alerts?.length || 0,
          totalSaved: parseFloat(result.stats?.totalSaved || 0).toFixed(2),
          recentDrops: recentDrops,
        };

        console.log("📊 Loaded stats:", newStats);
        setStats(newStats);
      } else {
        // Dev mode - sample data
        setStats({
          totalTracked: 5,
          totalPriceDrops: 12,
          totalSaved: '47.50',
          recentDrops: 2,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Listen for storage changes (auto-update when data changes)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const handleStorageChange = (changes, areaName) => {
        if (areaName === 'local') {
          if (changes.products || changes.alerts || changes.stats) {
            console.log("📊 Data changed, refreshing stats...");
            loadStats();
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh: loadStats,
  };
}