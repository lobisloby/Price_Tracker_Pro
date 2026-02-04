// src/dashboard/App.jsx
// ✅ LOCAL STORAGE ONLY - Simplified

import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { exportProducts, exportAlerts } from "../utils/export";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Analysis from "./pages/Analysis";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Premium from "./pages/Premium";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [productCount, setProductCount] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Handle export based on current page
  const handleExport = useCallback(async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["products", "alerts"]);

        if (currentPage === "products") {
          const success = exportProducts(result.products || []);
          if (success) {
            console.log("✅ Products exported successfully");
          }
        } else if (currentPage === "alerts") {
          const success = exportAlerts(result.alerts || []);
          if (success) {
            console.log("✅ Alerts exported successfully");
          }
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export: " + error.message);
    }
  }, [currentPage]);

  // Simple refresh - just reload the page content
  const handleRefresh = useCallback(() => {
    console.log("🔄 Refreshing...");
    const current = currentPage;
    setCurrentPage("");
    setTimeout(() => setCurrentPage(current), 50);
  }, [currentPage]);

  const handleAnalyze = (product) => {
    setSelectedProductId(product.id);
    setCurrentPage("analysis");
  };

  const renderPage = () => {
    if (!currentPage) return null;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard onAnalyze={handleAnalyze} />;
      case "products":
        return (
          <Products
            onProductCountChange={setProductCount}
            onAnalyze={handleAnalyze}
          />
        );
      case "analysis":
        return <Analysis selectedProductId={selectedProductId} />;
      case "alerts":
        return <Alerts />;
      case "settings":
        return <Settings />;
      case "premium":
        return <Premium />;
      default:
        return <Dashboard onAnalyze={handleAnalyze} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content */}
      <div className="ml-64 min-h-screen flex flex-col">
        <Header
          currentPage={currentPage}
          onExport={handleExport}
          onRefresh={handleRefresh}
          productCount={productCount}
        />
        <main className="flex-1 p-6 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;