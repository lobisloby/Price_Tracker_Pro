// src/content/content.js
// AliExpress Price Tracker Pro - Content Script
// ✅ Safe Version with Professional SVG Icons

console.log("✅ AliExpress Price Tracker: Content script loaded!");

// ============================================
// SVG ICONS (Inline, no dependencies)
// ============================================

const ICONS = {
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>`,
  
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>`,
  
  alertTriangle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>`,
  
  xCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>`,
  
  loader: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;animation:trackerSpin 1s linear infinite;">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>`,
  
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>`,
  
  trendingDown: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
    <polyline points="16 17 22 17 22 11"></polyline>
  </svg>`,
  
  trendingUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>`,
  
  rocket: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
  </svg>`,
  
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,
  
  shoppingCart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  </svg>`,
  
  x: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>`,
  
  bell: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>`,
  
  sparkles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>`,
};

// ============================================
// INJECT KEYFRAMES (only once)
// ============================================

function injectKeyframes() {
  if (document.getElementById("aliexpress-tracker-keyframes")) return;
  
  const style = document.createElement("style");
  style.id = "aliexpress-tracker-keyframes";
  style.textContent = `
    @keyframes trackerSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes trackerSlideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes trackerSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes trackerFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes trackerSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// CHECK IF WE'RE ON ALIEXPRESS
// ============================================

function isAliExpress() {
  return window.location.hostname.includes("aliexpress");
}

function isProductPage() {
  return window.location.pathname.includes("/item/");
}

// ============================================
// EXTRACT PRODUCT DATA
// ============================================

function extractProductData() {
  try {
    const titleSelectors = [
      'h1[data-pl="product-title"]',
      ".product-title-text",
      "h1.pdp-mod-product-badge-title",
      ".pdp-info h1",
      "h1",
    ];

    let title = "Unknown Product";
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        title = element.textContent.trim();
        break;
      }
    }

    const priceSelectors = [
      ".product-price-value",
      ".uniform-banner-box-price",
      '[class*="price--current"] span',
      ".pdp-mod-product-badge-price",
      '[class*="Price"] span',
      ".es--wrap--erdmtq8 span",
    ];

    let priceText = "0";
    for (const selector of priceSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        priceText = element.textContent.trim();
        break;
      }
    }

    const priceMatch = priceText.match(/[\d.,]+/);
    let price = 0;
    if (priceMatch) {
      let priceStr = priceMatch[0];
      if (priceStr.includes(",") && !priceStr.includes(".")) {
        priceStr = priceStr.replace(",", ".");
      } else {
        priceStr = priceStr.replace(",", "");
      }
      price = parseFloat(priceStr) || 0;
    }

    const currencyMatch = priceText.match(/[$€£¥₽]/);
    const currency = currencyMatch ? currencyMatch[0] : "$";

    const imageSelectors = [
      ".magnifier-image",
      ".pdp-mod-product-badge-img img",
      '[class*="slider"] img',
      ".images-view-item img",
      ".product-image img",
    ];

    let image = "";
    for (const selector of imageSelectors) {
      const element = document.querySelector(selector);
      if (element?.src) {
        image = element.src;
        break;
      }
    }

    const urlMatch = window.location.pathname.match(/\/item\/(\d+)/);
    const productId = urlMatch ? urlMatch[1] : Date.now().toString();

    const productData = {
      id: productId,
      title,
      price,
      currency,
      image,
      url: window.location.href,
      site: "aliexpress",
    };

    console.log("📦 Extracted product data:", productData);
    return productData;
  } catch (error) {
    console.error("❌ Error extracting product data:", error);
    return null;
  }
}

// ============================================
// BUTTON STYLES (keeping inline for safety)
// ============================================

const buttonStyles = {
  container: `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `,
  button: `
    padding: 14px 24px !important;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 12px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4) !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `,
  buttonHover: `
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 30px rgba(255, 107, 53, 0.5) !important;
  `,
  buttonTracked: `
    background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4) !important;
  `,
  buttonError: `
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%) !important;
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4) !important;
  `,
  buttonWarning: `
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4) !important;
  `,
  buttonChecking: `
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) !important;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4) !important;
  `,
};

// ============================================
// TRACK BUTTON UI
// ============================================

function createTrackButton() {
  injectKeyframes();

  const existing = document.querySelector("#aliexpress-tracker-btn");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "aliexpress-tracker-container";
  container.style.cssText = buttonStyles.container;

  const button = document.createElement("button");
  button.id = "aliexpress-tracker-btn";
  button.innerHTML = `${ICONS.search} <span>Track Price</span>`;
  button.style.cssText = buttonStyles.button;

  // Hover effects (keeping original approach)
  button.addEventListener("mouseenter", () => {
    if (!button.disabled) {
      button.style.cssText = buttonStyles.button + buttonStyles.buttonHover;
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!button.disabled) {
      // Restore correct state style
      const isTracked = button.innerHTML.includes("Tracking");
      if (isTracked) {
        button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;
      } else {
        button.style.cssText = buttonStyles.button;
      }
    }
  });

  button.addEventListener("click", handleTrackClick);

  container.appendChild(button);
  document.body.appendChild(container);

  checkIfTracked();

  return button;
}

async function checkIfTracked() {
  const button = document.querySelector("#aliexpress-tracker-btn");
  if (!button) return;

  const productData = extractProductData();
  if (!productData) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_PRODUCTS",
    });

    const products = response?.products || [];
    const baseUrl = productData.url.split("?")[0];
    const trackedProduct = products.find(
      (p) => p.url.split("?")[0] === baseUrl || p.id === productData.id,
    );

    if (trackedProduct) {
      button.innerHTML = `${ICONS.checkCircle} <span>Tracking</span>`;
      button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;
      button.disabled = true;

      console.log("📊 Product is tracked, checking for price changes...");
      setTimeout(() => checkForPriceChanges(), 1000);
    }
  } catch (error) {
    console.error("Error checking if tracked:", error);
  }
}

// ============================================
// UPGRADE MODAL
// ============================================

function showUpgradeModal() {
  const existing = document.querySelector("#aliexpress-tracker-upgrade-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "aliexpress-tracker-upgrade-modal";
  modal.innerHTML = `
    <div id="tracker-modal-backdrop" style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: trackerFadeIn 0.2s ease;
    ">
      <div style="
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        animation: trackerSlideUp 0.3s ease;
      ">
        <div style="margin-bottom: 16px;">${ICONS.rocket}</div>
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">
          Upgrade to Premium
        </h2>
        <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 14px; line-height: 1.5;">
          You've reached the free limit of <strong>5 products</strong>.<br>
          Upgrade to track <strong>unlimited products</strong>!
        </p>
        
        <div style="
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        ">
          <div style="font-size: 32px; font-weight: 700; color: #ea580c; margin: 0;">
            $3 <span style="font-size: 14px; font-weight: 400; color: #9a3412;">one-time</span>
          </div>
          <div style="font-size: 12px; color: #9a3412; margin: 4px 0 0 0;">Pay once, use forever!</div>
        </div>

        <ul style="
          text-align: left;
          margin: 0 0 20px 0;
          padding: 0;
          list-style: none;
          font-size: 14px;
          color: #374151;
        ">
          <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            ${ICONS.check} Unlimited product tracking
          </li>
          <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            ${ICONS.check} Priority price checking
          </li>
          <li style="display: flex; align-items: center; gap: 10px;">
            ${ICONS.check} Lifetime access
          </li>
        </ul>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="tracker-upgrade-btn" style="
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            ${ICONS.shoppingCart} Get Premium
          </button>
          <button id="tracker-close-modal-btn" style="
            width: 100%;
            padding: 12px;
            background: #f3f4f6;
            color: #6b7280;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            Maybe Later
          </button>
        </div>

        <p style="font-size: 11px; color: #9ca3af; margin: 16px 0 0 0;">
          Already have a key? Go to Dashboard → Premium to activate
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  document.getElementById("tracker-upgrade-btn")?.addEventListener("click", () => {
    window.open(
      "https://pricetrackerr.lemonsqueezy.com/checkout/buy/4a86e7a2-ab7e-4e2e-b1be-b3c64c1ff4d1",
      "_blank",
    );
    modal.remove();
  });

  document.getElementById("tracker-close-modal-btn")?.addEventListener("click", () => {
    modal.remove();
  });

  document.getElementById("tracker-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "tracker-modal-backdrop") {
      modal.remove();
    }
  });
}

// ============================================
// HANDLE TRACK CLICK
// ============================================

async function handleTrackClick() {
  const button = document.querySelector("#aliexpress-tracker-btn");
  if (!button) return;

  const productData = extractProductData();

  if (!productData || productData.price === 0) {
    button.innerHTML = `${ICONS.alertTriangle} <span>Could not get price</span>`;
    button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;

    setTimeout(() => {
      button.innerHTML = `${ICONS.search} <span>Track Price</span>`;
      button.style.cssText = buttonStyles.button;
    }, 2000);
    return;
  }

  // Loading state
  button.innerHTML = `${ICONS.loader} <span>Tracking...</span>`;
  button.style.cssText = buttonStyles.button + buttonStyles.buttonChecking;
  button.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TRACK_PRODUCT",
      data: productData,
    });

    console.log("Track response:", response);

    if (response?.success) {
      button.innerHTML = `${ICONS.checkCircle} <span>Tracking!</span>`;
      button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;

      const remaining = response.limit - response.currentCount;
      if (!response.isPro && remaining <= 2) {
        showToast(`Tracked! ${remaining} free slots left`, "warning");
      } else {
        showToast("Product added to tracking!", "success");
      }
    } else if (response?.error === "limit_reached") {
      button.innerHTML = `${ICONS.lock} <span>Limit Reached</span>`;
      button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;
      button.disabled = false;

      showUpgradeModal();

      setTimeout(() => {
        button.innerHTML = `${ICONS.search} <span>Track Price</span>`;
        button.style.cssText = buttonStyles.button;
      }, 3000);
    } else {
      button.innerHTML = `${ICONS.alertTriangle} <span>${response?.error || "Already tracked"}</span>`;
      button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;

      setTimeout(() => {
        if (response?.error === "Already tracked") {
          button.innerHTML = `${ICONS.checkCircle} <span>Tracking</span>`;
          button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;
          button.disabled = true;
        } else {
          button.innerHTML = `${ICONS.search} <span>Track Price</span>`;
          button.style.cssText = buttonStyles.button;
          button.disabled = false;
        }
      }, 2000);
    }
  } catch (error) {
    console.error("Error tracking product:", error);
    button.innerHTML = `${ICONS.xCircle} <span>Error</span>`;
    button.style.cssText = buttonStyles.button + buttonStyles.buttonError;
    button.disabled = false;

    setTimeout(() => {
      button.innerHTML = `${ICONS.search} <span>Track Price</span>`;
      button.style.cssText = buttonStyles.button;
    }, 2000);
  }
}

// ============================================
// PRICE CHECK
// ============================================

async function checkForPriceChanges() {
  const productData = extractProductData();
  if (!productData || productData.price === 0) return;

  try {
    console.log("🔍 Checking price:", productData.price);
    showToast("Checking price...", "info");

    const response = await chrome.runtime.sendMessage({
      type: "CHECK_PRICE",
      data: productData,
    });

    console.log("📥 Price check response:", response);

    if (response?.priceDropped) {
      console.log(`🎉 Price dropped! ${response.oldPrice} → ${response.newPrice}`);
      showPriceDropBanner(response);
      showToast(`Price dropped ${response.savings}%!`, "success");
    } else if (response?.priceChanged) {
      console.log(`📈 Price changed: ${response.oldPrice} → ${response.newPrice}`);
      if (response.newPrice > response.oldPrice) {
        showToast(`Price increased to ${productData.currency}${response.newPrice}`, "warning");
      }
    } else if (response?.tracked === false) {
      console.log("ℹ️ Product not in tracking list");
    } else {
      console.log("✅ Price unchanged");
      showToast("Price checked - no change", "info");
    }
  } catch (error) {
    console.error("Error checking price:", error);
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = "info") {
  const existing = document.querySelector("#aliexpress-tracker-toast");
  if (existing) existing.remove();

  const configs = {
    success: { bg: "#10B981", icon: ICONS.checkCircle },
    error: { bg: "#EF4444", icon: ICONS.xCircle },
    warning: { bg: "#F59E0B", icon: ICONS.alertTriangle },
    info: { bg: "#3B82F6", icon: ICONS.bell },
  };

  const config = configs[type] || configs.info;

  const toast = document.createElement("div");
  toast.id = "aliexpress-tracker-toast";
  toast.innerHTML = `${config.icon} <span>${message}</span>`;
  toast.style.cssText = `
    position: fixed !important;
    bottom: 80px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    padding: 12px 20px !important;
    background: ${config.bg} !important;
    color: white !important;
    border-radius: 12px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
    animation: trackerSlideIn 0.3s ease !important;
    max-width: 300px !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// PRICE DROP BANNER
// ============================================

function showPriceDropBanner(data) {
  const existing = document.querySelector("#aliexpress-tracker-banner");
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.id = "aliexpress-tracker-banner";
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 12px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${ICONS.trendingDown}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          ${ICONS.sparkles} Price Dropped!
        </div>
        <div style="font-size: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="text-decoration: line-through; opacity: 0.7;">${data.currency || "$"}${data.oldPrice}</span>
          <span>→</span>
          <span style="font-weight: 700; font-size: 18px;">${data.currency || "$"}${data.newPrice}</span>
          <span style="
            background: white;
            color: #10B981;
            padding: 2px 10px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
          ">-${data.savings}%</span>
        </div>
      </div>
      <button id="aliexpress-tracker-banner-close" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      ">${ICONS.x}</button>
    </div>
  `;
  banner.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    padding: 20px 24px !important;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
    color: white !important;
    border-radius: 16px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4) !important;
    animation: trackerSlideDown 0.4s ease !important;
    max-width: 420px !important;
  `;

  document.body.appendChild(banner);

  document.getElementById("aliexpress-tracker-banner-close")?.addEventListener("click", () => {
    banner.remove();
  });

  setTimeout(() => banner.remove(), 10000);
}

// ============================================
// INITIALIZE
// ============================================

function init() {
  if (!isAliExpress()) {
    console.log("Not on AliExpress, skipping...");
    return;
  }

  if (!isProductPage()) {
    console.log("Not a product page, skipping...");
    return;
  }

  console.log("🛒 AliExpress product page detected");
  createTrackButton();
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Also run after a delay (for dynamic content)
setTimeout(init, 2000);

// Listen for page navigation (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(init, 1000);
  }
}).observe(document, { subtree: true, childList: true });