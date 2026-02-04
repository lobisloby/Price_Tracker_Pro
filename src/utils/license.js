// src/utils/license.js
// License key management with LemonSqueezy

const LEMONSQUEEZY_API = "https://api.lemonsqueezy.com/v1/licenses";

// Your LemonSqueezy Store ID (you'll get this from your dashboard)
// Replace with your actual store ID after creating the product
const STORE_ID = "YOUR_STORE_ID"; 

export const LICENSE_CONFIG = {
  FREE_PRODUCT_LIMIT: 5,
  STORE_URL: "https://YOUR_STORE.lemonsqueezy.com/buy/YOUR_PRODUCT_ID", // Replace with your actual URL
};

/**
 * Check if user has premium
 */
export async function isPremium() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get(["isPro", "licenseKey"]);
      return result.isPro === true && result.licenseKey;
    }
    return false;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Get current product count
 */
export async function getProductCount() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get(["products"]);
      return result.products?.length || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error getting product count:", error);
    return 0;
  }
}

/**
 * Check if user can add more products
 */
export async function canAddProduct() {
  const premium = await isPremium();
  if (premium) return { allowed: true, isPremium: true };

  const count = await getProductCount();
  const allowed = count < LICENSE_CONFIG.FREE_PRODUCT_LIMIT;

  return {
    allowed,
    isPremium: false,
    currentCount: count,
    limit: LICENSE_CONFIG.FREE_PRODUCT_LIMIT,
    remaining: Math.max(0, LICENSE_CONFIG.FREE_PRODUCT_LIMIT - count),
  };
}

/**
 * Validate license key with LemonSqueezy
 */
export async function validateLicenseKey(licenseKey) {
  try {
    // Clean the license key
    const cleanKey = licenseKey.trim().toUpperCase();

    if (!cleanKey || cleanKey.length < 10) {
      return { valid: false, error: "Invalid license key format" };
    }

    // Try to validate with LemonSqueezy API
    try {
      const response = await fetch(`${LEMONSQUEEZY_API}/validate`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          license_key: cleanKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.valid || data.license_key?.status === "active") {
          return {
            valid: true,
            data: {
              key: cleanKey,
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
      }
    } catch (apiError) {
      console.log("LemonSqueezy API not available, using offline validation");
    }

    // Offline validation fallback (for testing or if API is unavailable)
    // In production, you should always use the API
    // This accepts any key that matches a pattern like: XXXX-XXXX-XXXX-XXXX
    const keyPattern = /^[A-Z0-9]{4,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}$/;
    
    if (keyPattern.test(cleanKey)) {
      return {
        valid: true,
        data: {
          key: cleanKey,
          activatedAt: new Date().toISOString(),
          offlineValidation: true,
        },
      };
    }

    return { valid: false, error: "Invalid license key format" };
  } catch (error) {
    console.error("License validation error:", error);
    return { valid: false, error: "Failed to validate license. Please try again." };
  }
}

/**
 * Activate license
 */
export async function activateLicense(licenseKey) {
  const validation = await validateLicenseKey(licenseKey);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({
        isPro: true,
        licenseKey: validation.data.key,
        licenseData: validation.data,
      });
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error("Error activating license:", error);
    return { success: false, error: "Failed to save license. Please try again." };
  }
}

/**
 * Deactivate license
 */
export async function deactivateLicense() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({
        isPro: false,
        licenseKey: "",
        licenseData: null,
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error deactivating license:", error);
    return { success: false, error: "Failed to deactivate license." };
  }
}

/**
 * Get license info
 */
export async function getLicenseInfo() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const result = await chrome.storage.local.get(["isPro", "licenseKey", "licenseData"]);
      return {
        isPro: result.isPro || false,
        licenseKey: result.licenseKey || "",
        licenseData: result.licenseData || null,
      };
    }
    return { isPro: false, licenseKey: "", licenseData: null };
  } catch (error) {
    console.error("Error getting license info:", error);
    return { isPro: false, licenseKey: "", licenseData: null };
  }
}