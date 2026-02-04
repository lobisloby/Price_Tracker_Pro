// src/dashboard/pages/Premium.jsx
// Simple one-card Premium page with LemonSqueezy integration

import React, { useState, useEffect } from "react";
import {
  isPremium,
  getProductCount,
  activateLicense,
  deactivateLicense,
  getLicenseInfo,
  LICENSE_CONFIG,
} from "../../utils/license";

function Premium() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [activating, setActivating] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const [licenseData, setLicenseData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["isPro", "products", "licenseData"]);
        setIsPro(result.isPro || false);
        setProductsCount(result.products?.length || 0);
        setLicenseData(result.licenseData || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError("Please enter a license key.");
      return;
    }

    setActivating(true);
    setError("");

    const result = await activateLicense(licenseKey);

    if (result.success) {
      setIsPro(true);
      setLicenseData(result.data);
      setLicenseKey("");
      alert("🎉 License activated! Welcome to Premium!");
    } else {
      setError(result.error || "Invalid license key. Please try again.");
    }

    setActivating(false);
  };

  const handleDeactivate = async () => {
    if (confirm("Are you sure you want to deactivate your license?")) {
      await deactivateLicense();
      setIsPro(false);
      setLicenseData(null);
      setLicenseKey("");
    }
  };

  const openStore = () => {
    // Replace with your actual LemonSqueezy store URL
    window.open("https://pricetrackerr.lemonsqueezy.com/checkout/buy/4a86e7a2-ab7e-4e2e-b1be-b3c64c1ff4d1", "_blank");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Current Status Card */}
      <div
        className={`rounded-2xl p-6 shadow-lg ${
          isPro
            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
            : "bg-white border-2 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{isPro ? "⭐" : "🆓"}</span>
            <div>
              <h2 className={`text-2xl font-bold ${isPro ? "text-white" : "text-gray-800"}`}>
                {isPro ? "Premium Activated" : "Free Plan"}
              </h2>
              <p className={isPro ? "text-white/80" : "text-gray-500"}>
                {isPro ? "Unlimited products forever!" : `${productsCount}/5 products used`}
              </p>
            </div>
          </div>
          {isPro && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              Lifetime
            </span>
          )}
        </div>

        {!isPro && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${(productsCount / 5) * 100}%` }}
            ></div>
          </div>
        )}

        {!isPro && productsCount >= 5 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
            <p className="text-amber-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              You've reached the free limit. Upgrade to track unlimited products!
            </p>
          </div>
        )}
      </div>

      {/* Premium Features Card */}
      {!isPro && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">🚀</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Upgrade to Premium
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-orange-500">$3</span>
              <span className="text-gray-500">one-time payment</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Pay once, use forever!</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-xl">📦</span>
              <div>
                <p className="font-medium text-gray-800">Unlimited Products</p>
                <p className="text-sm text-gray-500">Track as many products as you want</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-medium text-gray-800">Full Price History</p>
                <p className="text-sm text-gray-500">See all historical price data</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-medium text-gray-800">Instant Notifications</p>
                <p className="text-sm text-gray-500">Never miss a price drop</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-xl">💾</span>
              <div>
                <p className="font-medium text-gray-800">Export Data</p>
                <p className="text-sm text-gray-500">Download your data anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <span className="text-xl">❤️</span>
              <div>
                <p className="font-medium text-gray-800">Support Development</p>
                <p className="text-sm text-gray-500">Help keep this extension alive</p>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={openStore}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            Get Premium - $3
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Secure payment via LemonSqueezy
          </p>
        </div>
      )}

      {/* License Key Activation */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🔑</span>
          {isPro ? "License Status" : "Already have a license key?"}
        </h3>

        {isPro ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <span className="text-xl">✅</span>
                <span className="font-semibold">License Active</span>
              </div>
              <p className="text-emerald-600 text-sm">
                Your premium license is active. Enjoy unlimited tracking!
              </p>
              {licenseData?.activatedAt && (
                <p className="text-emerald-500 text-xs mt-2">
                  Activated: {new Date(licenseData.activatedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <button
              onClick={handleDeactivate}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Deactivate License
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter your license key below to activate premium features.
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors font-mono"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value.toUpperCase());
                  setError("");
                }}
              />
              <button
                onClick={handleActivate}
                disabled={activating || !licenseKey.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Checking...
                  </span>
                ) : (
                  "Activate"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Developer Message */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💙</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Built with love by one developer
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                The free version will always exist
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Premium helps me continue improving this extension
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                One-time payment — no subscriptions, ever
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Your license key works forever
              </li>
            </ul>
            <p className="text-gray-500 text-xs mt-4">
              Thank you for supporting independent development! 🙏
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>❓</span>
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-800 mb-1">
              Is this a subscription?
            </h4>
            <p className="text-gray-600 text-sm">
              No! It's a one-time payment. Pay $3 once and use Premium forever.
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-800 mb-1">
              Can I use my license on multiple devices?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes, your license key can be used on all your personal devices.
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-medium text-gray-800 mb-1">
              What payment methods do you accept?
            </h4>
            <p className="text-gray-600 text-sm">
              We accept credit cards, PayPal, and Apple Pay through LemonSqueezy.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">
              Do you offer refunds?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes! If you're not satisfied, contact me within 14 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Premium;