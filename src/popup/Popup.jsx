// src/popup/Popup.jsx
// ✅ Updated with upgrade prompt when at limit

import React, { useState, useEffect } from "react";
import icon48 from "../assets/icons/icon48.png";

const FREE_LIMIT = 5;

function Popup() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ drops: 0, saved: "0" });
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["products", "alerts", "stats", "isPro"]);
        setProducts(result.products || []);
        setIsPro(result.isPro || false);

        const recentDrops = (result.alerts || []).filter((alert) => {
          const alertTime = new Date(alert.time);
          const hoursSince = (new Date() - alertTime) / (1000 * 60 * 60);
          return hoursSince < 24 && alert.type === "price_drop";
        }).length;

        setStats({
          drops: recentDrops,
          saved: parseFloat(result.stats?.totalSaved || 0).toFixed(2),
        });
      } else {
        setProducts([
          {
            id: "1",
            title: "Sample Product for Testing",
            price: 29.99,
            currency: "$",
            image: "https://via.placeholder.com/40",
            site: "aliexpress",
          },
        ]);
        setStats({ drops: 2, saved: "15.50" });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    } else {
      window.open("/dashboard.html", "_blank");
    }
  };

  const openPremium = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html#premium") });
    }
  };

  const openAlerts = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html#alerts") });
    }
  };

  const atLimit = !isPro && products.length >= FREE_LIMIT;
  const nearLimit = !isPro && products.length >= FREE_LIMIT - 1;

  return (
    <div className="w-87.5 min-h-100 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              <img src={icon48} alt="" className="w-8 h-8" />
            </span>
            <h1 className="text-lg font-semibold">Price Tracker Pro</h1>
          </div>
          {isPro && (
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
              ⭐ PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-around py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center">
          <span className={`text-xl font-bold ${atLimit ? "text-red-500" : "text-orange-500"}`}>
            {products.length}{!isPro && `/${FREE_LIMIT}`}
          </span>
          <span className="text-xs text-gray-500 uppercase">Tracked</span>
        </div>
        <div
          className="flex flex-col items-center cursor-pointer hover:bg-gray-100 px-2 rounded"
          onClick={openAlerts}
        >
          <span className={`text-xl font-bold ${stats.drops > 0 ? "text-emerald-500" : "text-orange-500"}`}>
            {stats.drops}
          </span>
          <span className="text-xs text-gray-500 uppercase">
            {stats.drops > 0 ? "🔔 Drops!" : "Drops"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-emerald-500">${stats.saved}</span>
          <span className="text-xs text-gray-500 uppercase">Saved</span>
        </div>
      </div>

      {/* Limit Warning */}
      {atLimit && (
        <div
          onClick={openPremium}
          className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <div>
              <p className="text-sm font-semibold text-amber-700">Free Limit Reached</p>
              <p className="text-xs text-amber-600">
                Upgrade to Premium for unlimited tracking →
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Near Limit Warning */}
      {nearLimit && !atLimit && (
        <div className="mx-4 mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-600 text-center">
            ℹ️ {FREE_LIMIT - products.length} free slot{FREE_LIMIT - products.length !== 1 ? "s" : ""} remaining
          </p>
        </div>
      )}

      {/* Alert Banner (if recent drops) */}
      {stats.drops > 0 && (
        <div
          onClick={openAlerts}
          className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                {stats.drops} Price Drop{stats.drops > 1 ? "s" : ""} Today!
              </p>
              <p className="text-xs text-emerald-600">Click to view details</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="flex-1 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Products</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No products tracked yet.</p>
            <p className="text-xs text-gray-400">
              Visit AliExpress and click "Track Price" on any product
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => {
                  if (product.url) {
                    chrome.tabs.create({ url: product.url });
                  }
                }}
              >
                <img
                  src={product.image || "https://via.placeholder.com/40"}
                  alt={product.title}
                  className="w-10 h-10 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {product.title?.substring(0, 30)}...
                  </p>
                  <p className="text-sm font-semibold text-orange-500">
                    {product.currency}
                    {product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {products.length > 3 && (
              <p className="text-xs text-center text-gray-400 pt-2">
                +{products.length - 3} more products
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Button */}
      <div className="p-4">
        <button
          onClick={openDashboard}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          📊 Open Full Dashboard
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
        <span>v1.0.0</span>
        <div className="flex gap-3">
          {!isPro && (
            <button
              onClick={openPremium}
              className="text-orange-500 hover:underline cursor-pointer"
            >
              ⭐ Upgrade
            </button>
          )}
          <button
            onClick={openDashboard}
            className="text-orange-500 hover:underline cursor-pointer"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;