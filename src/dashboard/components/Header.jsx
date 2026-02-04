// src/dashboard/components/Header.jsx
// ✅ LOCAL STORAGE ONLY - No sync indicator

import React, { useState } from "react";

const pageTitles = {
  dashboard: "Dashboard",
  products: "Tracked Products",
  analysis: "Price Analysis",
  alerts: "Alerts History",
  settings: "Settings",
  premium: "Premium & Account",
};

const pageDescriptions = {
  dashboard: "Overview of your tracked products and savings",
  products: "Manage all your tracked AliExpress products",
  analysis: "Analyze price trends and history",
  alerts: "View all price drop notifications",
  settings: "Configure your preferences",
  premium: "Upgrade for unlimited features",
};

function Header({ currentPage, onExport, onRefresh, productCount = 0 }) {
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleExport = async () => {
    if (!onExport) return;

    setExporting(true);
    try {
      await onExport();
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  const handleRefresh = () => {
    if (!onRefresh) return;

    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header className="bg-white px-6 py-5 border-b border-gray-200">
      <div className="flex justify-between items-center">
        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {pageTitles[currentPage] || "Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {pageDescriptions[currentPage] || "Overview"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Export Button - Show on products and alerts pages */}
          {(currentPage === "products" || currentPage === "alerts") &&
            onExport && (
              <button
                onClick={handleExport}
                disabled={exporting || productCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Export CSV
                  </>
                )}
              </button>
            )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              Refresh
            </button>
          )}

          {/* AliExpress Link */}
          <a
            href="https://www.aliexpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
          >
            <span>🛒</span>
            Open AliExpress
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;