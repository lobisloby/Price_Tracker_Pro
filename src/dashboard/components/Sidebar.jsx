// src/dashboard/components/Sidebar.jsx
import React from "react";
import icon48 from "../../assets/icons/icon48.png";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "products", label: "Products", icon: "📦" },
  { id: "analysis", label: "Analysis", icon: "📈" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "premium", label: "Premium", icon: "⭐" },
];

function Sidebar({ currentPage, onNavigate }) {
  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed left-0 top-0 bottom-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={icon48} alt="" />
          <div>
            <h1 className="text-lg font-bold">AliExpress</h1>
            <p className="text-xs text-gray-400">Price Tracker Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-6 py-3.5 text-left transition-all duration-200 border-none cursor-pointer
              ${
                currentPage === item.id
                  ? "bg-orange-500/20 text-orange-400 border-r-4 border-r-orange-500"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => onNavigate("premium")}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
        >
          ⭐ Upgrade to Pro
        </button>
        <p className="text-center text-xs text-gray-500 mt-3">Version 1.0.0</p>
      </div>
    </div>
  );
}

export default Sidebar;
