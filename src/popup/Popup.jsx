// src/popup/Popup.jsx
// ✅ Updated with professional Lucide icons

import React, { useState, useEffect } from "react";
import {
  Crown,
  Bell,
  BellRing,
  Lock,
  Info,
  PartyPopper,
  LayoutDashboard,
  TrendingDown,
  PiggyBank,
  Package,
  ExternalLink,
  Settings,
  Sparkles,
  ChevronRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";
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
        const result = await chrome.storage.local.get([
          "products",
          "alerts",
          "stats",
          "isPro",
        ]);
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
        // Development fallback
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
      chrome.tabs.create({
        url: chrome.runtime.getURL("dashboard.html#premium"),
      });
    }
  };

  const openAlerts = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("dashboard.html#alerts"),
      });
    }
  };

  const atLimit = !isPro && products.length >= FREE_LIMIT;
  const nearLimit = !isPro && products.length >= FREE_LIMIT - 1;

  return (
    <div className="w-[350px] min-h-[400px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={icon48} alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-semibold">Price Tracker Pro</h1>
          </div>
          {isPro && (
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
              <Crown size={12} className="fill-yellow-300 text-yellow-300" />
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 py-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Package
              size={16}
              className={atLimit ? "text-red-500" : "text-orange-500"}
            />
            <span
              className={`text-xl font-bold ${atLimit ? "text-red-500" : "text-orange-500"}`}
            >
              {products.length}
              {!isPro && (
                <span className="text-sm font-normal text-gray-400">
                  /{FREE_LIMIT}
                </span>
              )}
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase mt-1">Tracked</span>
        </div>

        <div
          className="flex flex-col items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
          onClick={openAlerts}
        >
          <div className="flex items-center gap-1">
            {stats.drops > 0 ? (
              <BellRing size={16} className="text-emerald-500 animate-bounce" />
            ) : (
              <Bell size={16} className="text-gray-400" />
            )}
            <span
              className={`text-xl font-bold ${stats.drops > 0 ? "text-emerald-500" : "text-gray-400"}`}
            >
              {stats.drops}
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase mt-1">
            {stats.drops > 0 ? "Drops!" : "Drops"}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <PiggyBank size={16} className="text-emerald-500" />
            <span className="text-xl font-bold text-emerald-500">
              ${stats.saved}
            </span>
          </div>
          <span className="text-xs text-gray-500 uppercase mt-1">Saved</span>
        </div>
      </div>

      {/* Limit Warning */}
      {atLimit && (
        <div
          onClick={openPremium}
          className="mx-4 mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Lock size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700">
                Free Limit Reached
              </p>
              <p className="text-xs text-amber-600">
                Upgrade to Premium for unlimited tracking
              </p>
            </div>
            <ChevronRight
              size={20}
              className="text-amber-400 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      )}

      {/* Near Limit Warning */}
      {nearLimit && !atLimit && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 justify-center">
            <Info size={14} className="text-blue-500" />
            <p className="text-xs text-blue-600">
              {FREE_LIMIT - products.length} free slot
              {FREE_LIMIT - products.length !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
      )}

      {/* Alert Banner (if recent drops) */}
      {stats.drops > 0 && (
        <div
          onClick={openAlerts}
          className="mx-4 mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <PartyPopper size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700">
                {stats.drops} Price Drop{stats.drops > 1 ? "s" : ""} Today!
              </p>
              <p className="text-xs text-emerald-600">Click to view details</p>
            </div>
            <ChevronRight
              size={20}
              className="text-emerald-400 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ShoppingBag size={14} className="text-orange-500" />
            Recent Products
          </h2>
          {products.length > 0 && (
            <button
              onClick={openDashboard}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              View all
              <ExternalLink size={10} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No products tracked yet</p>
            <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
              Visit AliExpress and click "Track Price" on any product
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => {
                  if (product.url && typeof chrome !== "undefined") {
                    chrome.tabs.create({ url: product.url });
                  }
                }}
              >
                <img
                  src={product.image || "https://via.placeholder.com/40"}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate font-medium">
                    {product.title?.substring(0, 35)}...
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-orange-500">
                      {product.currency}
                      {product.price?.toFixed(2)}
                    </span>
                    {product.priceHistory?.length > 1 && (
                      <span className="flex items-center gap-0.5 text-xs text-emerald-500">
                        <TrendingDown size={10} />
                        tracked
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500 transition-colors"
                />
              </div>
            ))}

            {products.length > 3 && (
              <button
                onClick={openDashboard}
                className="w-full py-2 text-xs text-center text-gray-500 hover:text-orange-500 flex items-center justify-center gap-1 transition-colors"
              >
                +{products.length - 3} more products
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Button */}
      <div className="p-4 pt-0">
        <button
          onClick={openDashboard}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <LayoutDashboard size={18} />
          Open Full Dashboard
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
        <span className="flex items-center gap-1">
          <Sparkles size={10} />
          v1.0.1
        </span>
        <div className="flex gap-4">
          {!isPro && (
            <button
              onClick={openPremium}
              className="text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium cursor-pointer transition-colors"
            >
              <Crown size={12} />
              Upgrade
            </button>
          )}
          <button
            onClick={openDashboard}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Settings size={12} />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;