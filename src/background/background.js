// src/background/background.js
// AliExpress Price Tracker Pro - Background Script
// ✅ LOCAL STORAGE ONLY - No webhooks/Supabase

console.log(
  "✅ AliExpress Price Tracker: Background script loaded (Local Mode)!",
);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  alarms: {
    DAILY_REMINDER: "daily-reminder",
    CLEANUP: "cleanup",
  },
  intervals: {
    dailyReminder: 1440, // 24 hours
    cleanup: 360, // 6 hours
  },
};

// ============================================
// INSTALLATION & STARTUP
// ============================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("📦 Extension event:", details.reason);

  if (details.reason === "install") {
    // Initialize with empty data
    await chrome.storage.local.set({
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
    });

    showNotification(
      "welcome",
      "🎉 Welcome to AliExpress Price Tracker!",
      "Visit any AliExpress product page to start tracking.",
    );
  }

  setupAlarms();
  updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("🚀 Extension started");
  setupAlarms();
  updateBadge();
});

// ============================================
// ALARMS
// ============================================

async function setupAlarms() {
  await chrome.alarms.clearAll();

  chrome.alarms.create(CONFIG.alarms.DAILY_REMINDER, {
    delayInMinutes: 60,
    periodInMinutes: CONFIG.intervals.dailyReminder,
  });

  chrome.alarms.create(CONFIG.alarms.CLEANUP, {
    delayInMinutes: 10,
    periodInMinutes: CONFIG.intervals.cleanup,
  });

  console.log("⏰ Alarms set up");
}

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case CONFIG.alarms.DAILY_REMINDER:
      handleDailyReminder();
      break;
    case CONFIG.alarms.CLEANUP:
      handleCleanup();
      break;
  }
});

async function handleDailyReminder() {
  const { products, settings } = await chrome.storage.local.get([
    "products",
    "settings",
  ]);

  if (!settings?.enableNotifications) return;
  if (!products?.length) return;

  showNotification(
    "reminder",
    "📋 Check Your Tracked Products",
    `You have ${products.length} products. Visit them to check for price drops!`,
  );
}

async function handleCleanup() {
  const { alerts } = await chrome.storage.local.get(["alerts"]);
  if (alerts?.length > 100) {
    await chrome.storage.local.set({ alerts: alerts.slice(0, 100) });
    console.log("🧹 Cleaned up old alerts");
  }
}

// ============================================
// LICENSE VALIDATION (LemonSqueezy)
// ============================================

async function validateLicenseWithAPI(licenseKey) {
  try {
    console.log("🔑 Validating license with LemonSqueezy API...");
    
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        license_key: licenseKey,
      }),
    });

    const data = await response.json();
    console.log("🔑 LemonSqueezy response:", data);

    if (data.valid || data.license_key?.status === "active") {
      return {
        valid: true,
        data: {
          key: licenseKey,
          activatedAt: new Date().toISOString(),
          customerEmail: data.meta?.customer_email || data.license_key?.customer_email,
          customerName: data.meta?.customer_name || data.license_key?.customer_name,
        },
      };
    } else {
      return {
        valid: false,
        error: data.error || "License key is not valid or has been deactivated",
      };
    }
  } catch (error) {
    console.error("🔑 License API error:", error);
    return {
      valid: false,
      error: "Failed to validate license. Please check your internet connection.",
    };
  }
}

// ============================================
// MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message:", message.type || message.action);

  // Handle license validation
  if (message.action === "validateLicense") {
    validateLicenseWithAPI(message.licenseKey)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ valid: false, error: error.message }));
    return true; // Required for async sendResponse
  }

  const handlers = {
    TRACK_PRODUCT: () => handleTrackProduct(message.data),
    CHECK_PRICE: () => handleCheckPrice(message.data),
    GET_PRODUCTS: () => getProducts(),
    GET_ALERTS: () => getAlerts(),
    GET_STATS: () => getStats(),
    DELETE_PRODUCT: () => handleDeleteProduct(message.productId),
    CLEAR_ALERTS: () => clearAlerts(),
    UPDATE_SETTINGS: () => handleUpdateSettings(message.settings),
    OPEN_DASHBOARD: () => openDashboard(),
  };

  const handler = handlers[message.type];
  if (handler) {
    handler()
      .then((result) => {
        sendResponse(result || { success: true });
      })
      .catch((error) => {
        console.error("Handler error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  sendResponse({ success: false, error: "Unknown message type" });
  return false;
});

// ============================================
// HANDLERS
// ============================================

async function handleTrackProduct(productData) {
  try {
    console.log("📦 Tracking product:", productData.title?.substring(0, 50));

    const { products, stats, isPro } = await chrome.storage.local.get([
      "products",
      "stats",
      "isPro",
    ]);
    const productList = products || [];
    const currentStats = stats || {
      totalTracked: 0,
      totalPriceDrops: 0,
      totalSaved: 0,
    };

    // ✅ CHECK PRODUCT LIMIT (Free = 5 products max)
    const FREE_LIMIT = 5;
    if (!isPro && productList.length >= FREE_LIMIT) {
      console.log("⚠️ Product limit reached (Free plan)");
      return {
        success: false,
        error: "limit_reached",
        message:
          "You've reached the free plan limit of 5 products. Upgrade to Premium for unlimited tracking!",
        currentCount: productList.length,
        limit: FREE_LIMIT,
      };
    }

    // Check if already tracked (compare base URLs without query params)
    const baseUrl = productData.url.split("?")[0];
    const existingIndex = productList.findIndex(
      (p) => p.url.split("?")[0] === baseUrl,
    );

    if (existingIndex !== -1) {
      console.log("⚠️ Product already tracked");
      return { success: false, error: "Already tracked" };
    }

    // Create new product with price history
    const newProduct = {
      id: productData.id || Date.now().toString(),
      title: productData.title,
      price: productData.price,
      currency: productData.currency || "$",
      url: productData.url,
      image: productData.image || "",
      site: productData.site || "aliexpress",
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      lowestPrice: productData.price,
      highestPrice: productData.price,
      priceHistory: [
        {
          price: productData.price,
          date: new Date().toISOString(),
        },
      ],
    };

    productList.push(newProduct);
    currentStats.totalTracked = productList.length;

    await chrome.storage.local.set({
      products: productList,
      stats: currentStats,
    });

    updateBadge();

    showNotification(
      `track-${newProduct.id}`,
      "✅ Product Tracked!",
      `Now tracking: ${productData.title.substring(0, 40)}...`,
    );

    console.log("✅ Product tracked successfully");
    return {
      success: true,
      product: newProduct,
      currentCount: productList.length,
      limit: FREE_LIMIT,
      isPro: isPro || false,
    };
  } catch (error) {
    console.error("❌ Track product error:", error);
    return { success: false, error: error.message };
  }
}

async function handleCheckPrice(productData) {
  try {
    console.log("🔍 Checking price for:", productData.url?.substring(0, 50));

    const { products, alerts, stats, settings } =
      await chrome.storage.local.get([
        "products",
        "alerts",
        "stats",
        "settings",
      ]);

    const productList = products || [];
    const alertList = alerts || [];
    const currentStats = stats || {
      totalTracked: 0,
      totalPriceDrops: 0,
      totalSaved: 0,
    };

    // Find product by URL (ignore query params)
    const baseUrl = productData.url.split("?")[0];
    const productIndex = productList.findIndex(
      (p) => p.url.split("?")[0] === baseUrl,
    );

    if (productIndex === -1) {
      console.log("❌ Product not found in tracking list");
      return { success: true, tracked: false };
    }

    const product = productList[productIndex];
    const oldPrice = product.price;
    const newPrice = productData.price;

    console.log("💰 Price comparison:", { oldPrice, newPrice });

    // Update last checked time
    product.lastChecked = new Date().toISOString();

    // Check if price changed
    if (newPrice !== oldPrice && newPrice > 0) {
      const priceDropped = newPrice < oldPrice;
      const savings = (((oldPrice - newPrice) / oldPrice) * 100).toFixed(1);
      const savedAmount = Math.abs(oldPrice - newPrice).toFixed(2);

      console.log("📊 Price changed:", { priceDropped, savings, savedAmount });

      // Update product price
      product.price = newPrice;

      // Update lowest/highest prices
      product.lowestPrice = Math.min(product.lowestPrice || newPrice, newPrice);
      product.highestPrice = Math.max(
        product.highestPrice || newPrice,
        newPrice,
      );

      // Add to price history
      product.priceHistory = product.priceHistory || [];
      product.priceHistory.push({
        price: newPrice,
        date: new Date().toISOString(),
      });

      // Keep only last 50 price history entries
      if (product.priceHistory.length > 50) {
        product.priceHistory = product.priceHistory.slice(-50);
      }

      productList[productIndex] = product;

      if (priceDropped) {
        console.log("🎉 PRICE DROPPED! Creating alert...");

        // Create alert
        const newAlert = {
          id: Date.now().toString(),
          productId: product.id,
          productTitle: product.title,
          type: "price_drop",
          oldPrice,
          newPrice,
          savings,
          savedAmount,
          currency: product.currency,
          url: product.url,
          image: product.image,
          time: new Date().toISOString(),
        };

        alertList.unshift(newAlert);

        // Update stats
        currentStats.totalPriceDrops = (currentStats.totalPriceDrops || 0) + 1;
        currentStats.totalSaved = (
          parseFloat(currentStats.totalSaved || 0) + parseFloat(savedAmount)
        ).toFixed(2);

        // Save everything
        await chrome.storage.local.set({
          products: productList,
          alerts: alertList.slice(0, 100), // Keep max 100 alerts
          stats: currentStats,
        });

        console.log("💾 Saved price drop data");

        // Update badge
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "#10B981" });

        // Show notification
        if (settings?.enableNotifications !== false) {
          chrome.notifications.create(
            `price-drop-${product.id}-${Date.now()}`,
            {
              type: "basic",
              iconUrl: "icons/icon128.png",
              title: "🔔 Price Drop!",
              message: `${product.title.substring(0, 40)}... is now ${product.currency}${newPrice} (was ${product.currency}${oldPrice})`,
              priority: 2,
              requireInteraction: true,
            },
            (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error("Notification error:", chrome.runtime.lastError);
              } else {
                console.log("✅ Notification shown:", notificationId);
              }
            },
          );
        }

        return {
          success: true,
          priceDropped: true,
          oldPrice,
          newPrice,
          savings,
        };
      }

      // Price increased (not a drop)
      await chrome.storage.local.set({ products: productList });
      console.log("📈 Price increased, saved");
      return { success: true, priceChanged: true, oldPrice, newPrice };
    }

    // Price unchanged - just update lastChecked
    await chrome.storage.local.set({ products: productList });
    console.log("➡️ Price unchanged");
    return { success: true, priceChanged: false };
  } catch (error) {
    console.error("❌ handleCheckPrice error:", error);
    return { success: false, error: error.message };
  }
}

async function handleDeleteProduct(productId) {
  try {
    console.log("🗑️ Deleting product:", productId);

    const { products, stats } = await chrome.storage.local.get([
      "products",
      "stats",
    ]);

    const updatedProducts = (products || []).filter((p) => p.id !== productId);
    const updatedStats = {
      ...stats,
      totalTracked: updatedProducts.length,
    };

    await chrome.storage.local.set({
      products: updatedProducts,
      stats: updatedStats,
    });

    updateBadge();
    console.log("✅ Product deleted");

    return { success: true };
  } catch (error) {
    console.error("❌ Delete error:", error);
    return { success: false, error: error.message };
  }
}

async function handleUpdateSettings(newSettings) {
  try {
    const { settings: existingSettings } = await chrome.storage.local.get([
      "settings",
    ]);

    const updated = {
      enableNotifications: true,
      enableBadge: true,
      checkFrequency: 60,
      ...existingSettings,
      ...newSettings,
    };

    await chrome.storage.local.set({ settings: updated });

    console.log("✅ Settings updated:", updated);
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }
}

async function getProducts() {
  const { products } = await chrome.storage.local.get(["products"]);
  return { products: products || [] };
}

async function getAlerts() {
  const { alerts } = await chrome.storage.local.get(["alerts"]);
  return { alerts: alerts || [] };
}

async function getStats() {
  const { stats, products, alerts } = await chrome.storage.local.get([
    "stats",
    "products",
    "alerts",
  ]);
  return {
    stats: stats || {},
    productCount: products?.length || 0,
    alertCount: alerts?.length || 0,
  };
}

async function clearAlerts() {
  await chrome.storage.local.set({ alerts: [] });
  updateBadge();
  return { success: true };
}

async function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
  return { success: true };
}

// ============================================
// UTILITIES
// ============================================

async function updateBadge() {
  const { products, alerts, settings } = await chrome.storage.local.get([
    "products",
    "alerts",
    "settings",
  ]);

  if (settings?.enableBadge === false) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  const recentDrops = (alerts || []).filter((a) => {
    const hours = (new Date() - new Date(a.time)) / (1000 * 60 * 60);
    return hours < 24 && a.type === "price_drop";
  }).length;

  if (recentDrops > 0) {
    chrome.action.setBadgeText({ text: recentDrops.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#10B981" });
  } else if (products?.length > 0) {
    chrome.action.setBadgeText({ text: products.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#ff6b35" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

function showNotification(id, title, message) {
  chrome.notifications.create(
    id,
    {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title,
      message,
      priority: 2,
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("Notification error:", chrome.runtime.lastError);
      }
    },
  );
}

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
});

// ============================================
// INITIALIZE
// ============================================

updateBadge();
console.log("✅ Background script ready (Local Storage Mode)");