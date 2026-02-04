// src/dashboard/pages/Dashboard.jsx
// ✅ Updated with auto-refresh on data changes

import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import ProductCard from '../components/ProductCard';
import { useStats } from '../hooks/useStats';

function Dashboard({ onAnalyze }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading } = useStats();

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ NEW: Listen for storage changes
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const handleStorageChange = (changes, areaName) => {
        if (areaName === 'local' && changes.products) {
          console.log("📦 Products updated, refreshing dashboard...");
          setProducts(changes.products.newValue || []);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const loadProducts = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['products']);
        setProducts(result.products || []);
      } else {
        // Dev mode - sample data
        setProducts([
          {
            id: '1',
            title: 'Wireless Bluetooth Headphones - Great Sound Quality',
            price: 29.99,
            currency: '$',
            image: 'https://via.placeholder.com/100',
            site: 'aliexpress',
            url: 'https://aliexpress.com/item/123.html',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            priceHistory: [
              { price: 39.99, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 29.99, date: new Date().toISOString() },
            ],
          },
          {
            id: '2',
            title: 'USB-C Hub Adapter 7 in 1 - Multi Port',
            price: 15.99,
            currency: '$',
            image: 'https://via.placeholder.com/100',
            site: 'aliexpress',
            url: 'https://aliexpress.com/item/456.html',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            priceHistory: [
              { price: 22.00, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 15.99, date: new Date().toISOString() },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({ type: 'DELETE_PRODUCT', productId });
      }
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Get recent products (last 5)
  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          icon="📦"
          value={statsLoading ? '...' : stats.totalTracked}
          label="Products Tracked"
          color="orange"
        />
        <StatsCard
          icon="📉"
          value={statsLoading ? '...' : stats.totalPriceDrops}
          label="Total Price Drops"
          color="green"
          trend={stats.recentDrops > 0 ? `${stats.recentDrops} today` : null}
          trendDirection="up"
        />
        <StatsCard
          icon="💰"
          value={statsLoading ? '...' : `$${stats.totalSaved}`}
          label="Total Saved"
          color="blue"
        />
        <StatsCard
          icon="🔔"
          value={statsLoading ? '...' : stats.recentDrops}
          label="Recent Alerts"
          color="purple"
        />
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            📦 Recent Products
          </h2>
          <span className="text-sm text-gray-500">
            {products.length} total
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            Loading products...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Visit AliExpress and click "Track Price" on any product to start tracking.
            </p>
            <a
              href="https://www.aliexpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              🛒 Go to AliExpress
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={handleDelete}
                onAnalyze={onAnalyze}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-semibold text-lg mb-1">Pro Tip</h3>
            <p className="text-orange-100">
              Visit your tracked products regularly! The extension automatically checks 
              for price changes and notifies you when prices drop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;