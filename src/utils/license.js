// src/utils/license.js
// License key management with LemonSqueezy

const LEMONSQUEEZY_API = "https://api.lemonsqueezy.com/v1/licenses";

const STORE_ID = "270988"; 

export const LICENSE_CONFIG = {
  FREE_PRODUCT_LIMIT: 5,
  STORE_URL: "https://pricetrackerr.lemonsqueezy.com/checkout/buy/4a86e7a2-ab7e-4e2e-b1be-b3c64c1ff4d1", 
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
 * Clean license key - remove spaces, special characters
 */
function cleanLicenseKey(key) {
  return key
    .trim()
    .replace(/\s/g, '')      // Remove all spaces
    .replace(/[^\w-]/g, '')  // Remove special characters except dash
    .toUpperCase();
}

/**
 * Validate license key format
 * Accepts UUID format (LemonSqueezy)
 */
function isValidKeyFormat(key) {
  // UUID format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (36 chars)
  const uuidPattern = /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/;
  
  return uuidPattern.test(key);
}

/**
 * Validate license key with LemonSqueezy
 */
export async function validateLicenseKey(licenseKey) {
  try {
    // Clean the license key
    const cleanKey = cleanLicenseKey(licenseKey);

    // Debug logging (remove in production if you want)
    console.log("Validating key:", cleanKey);
    console.log("Key length:", cleanKey.length);

    // Check format first
    if (!cleanKey) {
      return { valid: false, error: "Please enter a license key" };
    }

    if (cleanKey.length !== 36) {
      return { valid: false, error: "Invalid license key length. Expected 36 characters." };
    }

    if (!isValidKeyFormat(cleanKey)) {
      return { valid: false, error: "Invalid license key format" };
    }

    // Validate with LemonSqueezy API
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
      } else {
        // Handle non-OK response
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          error: errorData.error || "Failed to validate license with server",
        };
      }
    } catch (apiError) {
      console.error("LemonSqueezy API error:", apiError);
      return {
        valid: false,
        error: "Unable to connect to license server. Please check your internet connection.",
      };
    }
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