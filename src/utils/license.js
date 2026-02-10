// src/utils/license.js
// Secure License Management with Tamper Protection

const LEMONSQUEEZY_API = "https://api.lemonsqueezy.com/v1/licenses";

export const LICENSE_CONFIG = {
  FREE_PRODUCT_LIMIT: 5,
  STORE_URL:
    "https://pricetrackerr.lemonsqueezy.com/checkout/buy/4a86e7a2-ab7e-4e2e-b1be-b3c64c1ff4d1",
  REVALIDATION_DAYS: 7,
};

// ============================================
// SECURE KEY INFRASTRUCTURE
// ============================================

// Secret key components stored as char codes (harder to extract after obfuscation)
// These reconstruct the signing secret at runtime
const _a = [80, 114, 49, 99, 51, 84, 114, 52, 99, 107, 51, 114];
const _b = [95, 83, 51, 99, 114, 51, 116, 33, 75, 51, 89];

// Obfuscated storage keys (not obvious in DevTools)
const _SK = {
  token: "_xpt",
  signature: "_xps",
  validated: "_xpv",
};

// Build secret at runtime (includes extension ID for uniqueness)
function _buildSecret() {
  const p1 = String.fromCharCode(..._a);
  const p2 = String.fromCharCode(..._b);
  try {
    return p1 + p2 + chrome.runtime.id;
  } catch {
    return p1 + p2;
  }
}

// HMAC-SHA256 signing using Web Crypto API
async function _sign(data) {
  const secret = _buildSecret();
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", keyMaterial, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// Verify HMAC signature
async function _verify(data, signature) {
  try {
    const expected = await _sign(data);
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false;
    let result = 0;
    for (let i = 0; i < expected.length; i++) {
      result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

// Encode data to token
function _encodeToken(obj) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return null;
  }
}

// Decode token to data
function _decodeToken(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return null;
  }
}

// ============================================
// SECURE PREMIUM CHECK
// ============================================

/**
 * Check if user has premium (tamper-proof)
 * This IGNORES any plain "isPro" field in storage
 */
export async function isPremium() {
  try {
    if (typeof chrome === "undefined" || !chrome.storage) return false;

    const result = await chrome.storage.local.get([
      _SK.token,
      _SK.signature,
      _SK.validated,
    ]);

    const token = result[_SK.token];
    const sig = result[_SK.signature];

    // No token = not premium
    if (!token || !sig) return false;

    // Verify signature integrity (detects tampering)
    const isValid = await _verify(token, sig);
    if (!isValid) {
      console.warn("⚠️ License integrity check failed - tampering detected");
      // Clear tampered data
      await chrome.storage.local.remove([
        _SK.token,
        _SK.signature,
        _SK.validated,
        // Also clear old format if exists
        "isPro",
        "licenseKey",
        "licenseData",
      ]);
      return false;
    }

    // Decode and verify token has required data
    const data = _decodeToken(token);
    if (!data || !data.k) return false;

    // Check if periodic re-validation is needed
    const lastValidation = result[_SK.validated] || 0;
    const daysSince =
      (Date.now() - lastValidation) / (1000 * 60 * 60 * 24);

    if (daysSince > LICENSE_CONFIG.REVALIDATION_DAYS) {
      // Re-validate in background (non-blocking)
      _revalidateWithAPI(data.k).catch(() => {});
    }

    return true;
  } catch (error) {
    console.error("Premium check error:", error);
    return false;
  }
}

// ============================================
// API RE-VALIDATION
// ============================================

async function _revalidateWithAPI(licenseKey) {
  try {
    const response = await fetch(`${LEMONSQUEEZY_API}/validate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_key: licenseKey }),
    });

    const data = await response.json();

    if (data.valid || data.license_key?.status === "active") {
      // License still valid - update validation timestamp
      await chrome.storage.local.set({ [_SK.validated]: Date.now() });
      return true;
    } else {
      // License revoked/expired - remove premium
      console.warn("⚠️ License no longer valid, revoking premium");
      await chrome.storage.local.remove([
        _SK.token,
        _SK.signature,
        _SK.validated,
        "isPro",
        "licenseKey",
        "licenseData",
      ]);
      return false;
    }
  } catch (error) {
    // Network error - keep premium (grace period)
    console.error("Re-validation network error:", error);
    return true;
  }
}

// ============================================
// PRODUCT COUNT & LIMITS
// ============================================

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

// ============================================
// LICENSE KEY VALIDATION
// ============================================

/**
 * Clean license key input
 */
function cleanLicenseKey(key) {
  return key
    .trim()
    .replace(/\s/g, "")
    .replace(/[^\w-]/g, "")
    .toUpperCase();
}

/**
 * Validate license key format (UUID)
 */
function isValidKeyFormat(key) {
  const uuidPattern =
    /^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/;
  return uuidPattern.test(key);
}

/**
 * Validate license key with LemonSqueezy API
 */
export async function validateLicenseKey(licenseKey) {
  try {
    const cleanKey = cleanLicenseKey(licenseKey);

    if (!cleanKey) {
      return { valid: false, error: "Please enter a license key" };
    }

    if (cleanKey.length !== 36) {
      return {
        valid: false,
        error: "Invalid license key length. Expected 36 characters.",
      };
    }

    if (!isValidKeyFormat(cleanKey)) {
      return { valid: false, error: "Invalid license key format" };
    }

    // Validate with LemonSqueezy API
    try {
      const response = await fetch(`${LEMONSQUEEZY_API}/validate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ license_key: cleanKey }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.valid || data.license_key?.status === "active") {
          return {
            valid: true,
            data: {
              key: cleanKey,
              activatedAt: new Date().toISOString(),
              customerEmail:
                data.meta?.customer_email ||
                data.license_key?.customer_email,
              customerName:
                data.meta?.customer_name ||
                data.license_key?.customer_name,
            },
          };
        } else {
          return {
            valid: false,
            error:
              data.error ||
              "License key is not valid or has been deactivated",
          };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          error:
            errorData.error || "Failed to validate license with server",
        };
      }
    } catch (apiError) {
      console.error("LemonSqueezy API error:", apiError);
      return {
        valid: false,
        error:
          "Unable to connect to license server. Please check your internet connection.",
      };
    }
  } catch (error) {
    console.error("License validation error:", error);
    return {
      valid: false,
      error: "Failed to validate license. Please try again.",
    };
  }
}

// ============================================
// SECURE ACTIVATION & DEACTIVATION
// ============================================

/**
 * Activate license - validates with API and stores secure token
 */
export async function activateLicense(licenseKey) {
  const validation = await validateLicenseKey(licenseKey);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      // Create secure token
      const tokenData = {
        k: validation.data.key,
        a: validation.data.activatedAt,
        e: validation.data.customerEmail || "",
        n: validation.data.customerName || "",
      };

      const token = _encodeToken(tokenData);
      if (!token) {
        return { success: false, error: "Failed to create license token" };
      }

      // Sign the token
      const signature = await _sign(token);

      // Store secure token (NOT plain isPro!)
      await chrome.storage.local.set({
        [_SK.token]: token,
        [_SK.signature]: signature,
        [_SK.validated]: Date.now(),
      });

      // Remove old insecure fields if they exist
      await chrome.storage.local.remove([
        "isPro",
        "licenseKey",
        "licenseData",
      ]);
    }

    return { success: true, data: validation.data };
  } catch (error) {
    console.error("Error activating license:", error);
    return {
      success: false,
      error: "Failed to save license. Please try again.",
    };
  }
}

/**
 * Deactivate license - clears all secure tokens
 */
export async function deactivateLicense() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage) {
      // Clear secure tokens
      await chrome.storage.local.remove([
        _SK.token,
        _SK.signature,
        _SK.validated,
        // Also clear any old format
        "isPro",
        "licenseKey",
        "licenseData",
      ]);
    }
    return { success: true };
  } catch (error) {
    console.error("Error deactivating license:", error);
    return { success: false, error: "Failed to deactivate license." };
  }
}

// ============================================
// LICENSE INFO (for UI display)
// ============================================

/**
 * Get license info for dashboard display
 * Returns same format as before for backward compatibility
 */
export async function getLicenseInfo() {
  try {
    if (typeof chrome === "undefined" || !chrome.storage) {
      return { isPro: false, licenseKey: "", licenseData: null };
    }

    const result = await chrome.storage.local.get([
      _SK.token,
      _SK.signature,
      _SK.validated,
    ]);

    const token = result[_SK.token];
    const sig = result[_SK.signature];

    // No token
    if (!token || !sig) {
      return { isPro: false, licenseKey: "", licenseData: null };
    }

    // Verify integrity
    const isValid = await _verify(token, sig);
    if (!isValid) {
      // Tampered - clear and return free
      await chrome.storage.local.remove([
        _SK.token,
        _SK.signature,
        _SK.validated,
        "isPro",
        "licenseKey",
        "licenseData",
      ]);
      return { isPro: false, licenseKey: "", licenseData: null };
    }

    // Decode token for display
    const data = _decodeToken(token);
    if (!data || !data.k) {
      return { isPro: false, licenseKey: "", licenseData: null };
    }

    // Return in same format as before (backward compatible)
    return {
      isPro: true,
      licenseKey: data.k,
      licenseData: {
        key: data.k,
        activatedAt: data.a,
        customerEmail: data.e,
        customerName: data.n,
      },
    };
  } catch (error) {
    console.error("Error getting license info:", error);
    return { isPro: false, licenseKey: "", licenseData: null };
  }
}