// src/dashboard/hooks/useAlerts.js
// ✅ Updated with storage change listener for auto-updates

import { useState, useEffect, useCallback } from 'react';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);

      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['alerts']);
        console.log("🔔 Loaded alerts:", result.alerts?.length || 0);
        setAlerts(result.alerts || []);
      } else {
        // Dev mode - sample data
        setAlerts([
          {
            id: '1',
            productId: 'prod-1',
            productTitle: 'Wireless Bluetooth Headphones - Great Sound Quality',
            type: 'price_drop',
            oldPrice: 45.99,
            newPrice: 29.99,
            savings: '34.8',
            savedAmount: '16.00',
            currency: '$',
            url: 'https://aliexpress.com/item/123.html',
            image: 'https://via.placeholder.com/100',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            productId: 'prod-2',
            productTitle: 'USB-C Hub Adapter 7 in 1 Multi Port',
            type: 'price_drop',
            oldPrice: 22.00,
            newPrice: 15.99,
            savings: '27.3',
            savedAmount: '6.01',
            currency: '$',
            url: 'https://aliexpress.com/item/456.html',
            image: 'https://via.placeholder.com/100',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NEW: Listen for storage changes (auto-update when new alerts arrive)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const handleStorageChange = (changes, areaName) => {
        if (areaName === 'local' && changes.alerts) {
          console.log("🔔 Alerts updated in storage, refreshing...");
          setAlerts(changes.alerts.newValue || []);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Clear all alerts
  const clearAlerts = useCallback(async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ alerts: [] });
        
        // Also reset stats
        const { stats } = await chrome.storage.local.get(['stats']);
        await chrome.storage.local.set({
          stats: { ...stats, totalPriceDrops: 0, totalSaved: 0 }
        });
      }
      setAlerts([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing alerts:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Delete single alert
  const deleteAlert = useCallback(async (alertId) => {
    try {
      const updatedAlerts = alerts.filter(a => a.id !== alertId);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ alerts: updatedAlerts });
      }
      
      setAlerts(updatedAlerts);
      return { success: true };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { success: false, error: error.message };
    }
  }, [alerts]);

  // Group alerts by date
  const groupedAlerts = useCallback(() => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    alerts.forEach(alert => {
      const alertDate = new Date(alert.time);
      
      if (alertDate >= today) {
        groups.today.push(alert);
      } else if (alertDate >= yesterday) {
        groups.yesterday.push(alert);
      } else if (alertDate >= weekAgo) {
        groups.thisWeek.push(alert);
      } else {
        groups.older.push(alert);
      }
    });

    return groups;
  }, [alerts]);

  // Calculate total savings
  const totalSavings = alerts.reduce((sum, alert) => {
    return sum + parseFloat(alert.savedAmount || 0);
  }, 0).toFixed(2);

  return {
    alerts,
    loading,
    groupedAlerts: groupedAlerts(),
    totalSavings,
    totalAlerts: alerts.length,
    refresh: loadAlerts,
    clearAlerts,
    deleteAlert,
  };
}