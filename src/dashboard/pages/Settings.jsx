// src/dashboard/pages/Settings.jsx
// ✅ LOCAL STORAGE ONLY - Email/Telegram options hidden

import React, { useState, useEffect } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    checkFrequency: 60,
    enableNotifications: true,
    enableBadge: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["settings"]);
        if (result.settings && typeof result.settings === "object") {
          const loadedSettings = {
            checkFrequency: 60,
            enableNotifications: true,
            enableBadge: true,
            ...result.settings,
          };
          if (loadedSettings.checkFrequency) {
            loadedSettings.checkFrequency =
              parseInt(loadedSettings.checkFrequency, 10) || 60;
          }
          console.log("Loaded settings:", loadedSettings);
          setSettings(loadedSettings);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsToSave = {
        checkFrequency: parseInt(settings.checkFrequency, 10) || 60,
        enableNotifications: settings.enableNotifications !== false,
        enableBadge: settings.enableBadge !== false,
      };

      console.log("Saving settings:", settingsToSave);

      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage(
          {
            type: "UPDATE_SETTINGS",
            settings: settingsToSave,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError);
              return;
            }

            if (response?.success) {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            } else {
              alert("Failed to save settings: " + (response?.error || "Unknown error"));
            }
          }
        );
      } else {
        // Dev mode
        console.log("Settings saved (dev mode):", settingsToSave);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings: " + error.message);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const frequencyToHours = (minutes) => {
    return Math.round(minutes / 60);
  };

  const exportData = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(null);
        const dataStr = JSON.stringify(result, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("✅ Data exported successfully!");
      } else {
        alert("Export not available in dev mode");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("❌ Failed to export data");
    }
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (typeof chrome !== "undefined" && chrome.storage) {
          await chrome.storage.local.set(data);
          await loadSettings();
          alert("✅ Data imported successfully! Refresh the page to see changes.");
        } else {
          alert("Import not available in dev mode");
        }
      } catch (error) {
        console.error("Error importing data:", error);
        alert("❌ Failed to import data. Invalid file format.");
      }
    };
    input.click();
  };

  const clearAllData = async () => {
    const confirmed = confirm(
      "⚠️ Are you sure you want to delete ALL data?\n\n" +
        "This will remove:\n" +
        "• All tracked products\n" +
        "• All price alerts\n" +
        "• All price history\n" +
        "• All settings\n\n" +
        "This action cannot be undone!"
    );

    if (confirmed) {
      try {
        if (typeof chrome !== "undefined" && chrome.storage) {
          await chrome.storage.local.clear();

          const defaultData = {
            products: [],
            alerts: [],
            settings: {
              enableNotifications: true,
              enableBadge: true,
              checkFrequency: 60,
            },
            stats: {
              totalTracked: 0,
              totalPriceDrops: 0,
              totalSaved: 0,
            },
          };

          await chrome.storage.local.set(defaultData);
          setSettings(defaultData.settings);
          alert("✅ All data has been cleared.");
        }
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("❌ Failed to clear data.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Notifications */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🔔 Notifications
        </h2>

        <div className="space-y-4">
          {/* Browser Notifications */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌐</span>
              <div>
                <div className="font-medium text-gray-800">
                  Browser Notifications
                </div>
                <div className="text-xs text-gray-500">
                  Get notified when prices drop
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
              checked={settings.enableNotifications}
              onChange={(e) =>
                handleChange("enableNotifications", e.target.checked)
              }
            />
          </label>

          {/* Badge */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔢</span>
              <div>
                <div className="font-medium text-gray-800">Extension Badge</div>
                <div className="text-xs text-gray-500">
                  Show product count on extension icon
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
              checked={settings.enableBadge}
              onChange={(e) => handleChange("enableBadge", e.target.checked)}
            />
          </label>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ℹ️ How Price Tracking Works
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Visit your tracked products regularly!</strong> The extension 
            checks prices when you visit the product page on AliExpress. 
            If the price has dropped, you'll get a notification instantly.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗄️ Data Management
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            📤 Export Data
          </button>
          <button
            onClick={importData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            📥 Import Data
          </button>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            🗑️ Clear All Data
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 Tip: Export your data regularly to keep a backup of your tracked products and price history.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={saveSettings}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
        >
          {saved ? "✅ Saved!" : "💾 Save Settings"}
        </button>
        {saved && (
          <span className="text-emerald-500 text-sm">
            Settings saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}

export default Settings;