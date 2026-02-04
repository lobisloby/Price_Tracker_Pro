// src/content/content.js
// AliExpress Price Tracker Pro - Content Script
// ✅ Updated with better price check feedback

console.log("✅ AliExpress Price Tracker: Content script loaded!");

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
    // Title - try multiple selectors
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

    // Price - try multiple selectors
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

    // Parse price (handle formats like "$29.99", "US $29.99", "29,99 €")
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

    // Currency
    const currencyMatch = priceText.match(/[$€£¥₽]/);
    const currency = currencyMatch ? currencyMatch[0] : "$";

    // Image
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

    // Product ID from URL
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
// TRACK BUTTON UI
// ============================================

const buttonStyles = {
  container: `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `,
  button: `
    padding: 14px 24px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  buttonHover: `
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(255, 107, 53, 0.5);
  `,
  buttonTracked: `
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  `,
  buttonError: `
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
  `,
  buttonWarning: `
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
  `,
  buttonChecking: `
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  `,
};

function createTrackButton() {
  // Remove existing button if any
  const existing = document.querySelector("#aliexpress-tracker-btn");
  if (existing) existing.remove();

  // Create container
  const container = document.createElement("div");
  container.id = "aliexpress-tracker-container";
  container.style.cssText = buttonStyles.container;

  // Create button
  const button = document.createElement("button");
  button.id = "aliexpress-tracker-btn";
  button.innerHTML = "🔍 Track Price";
  button.style.cssText = buttonStyles.button;

  // Hover effects
  button.addEventListener("mouseenter", () => {
    if (!button.disabled) {
      button.style.cssText = buttonStyles.button + buttonStyles.buttonHover;
    }
  });

  button.addEventListener("mouseleave", () => {
    if (!button.disabled) {
      button.style.cssText = buttonStyles.button;
    }
  });

  // Click handler
  button.addEventListener("click", handleTrackClick);

  container.appendChild(button);
  document.body.appendChild(container);

  // Check if product is already tracked
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
      button.innerHTML = "✅ Tracking";
      button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;
      button.disabled = true;

      // ✅ Auto-check price for tracked products
      console.log("📊 Product is tracked, checking for price changes...");
      setTimeout(() => checkForPriceChanges(), 1000);
    }
  } catch (error) {
    console.error("Error checking if tracked:", error);
  }
}

// ============================================
// UPGRADE MODAL (for free users at limit)
// ============================================

function showUpgradeModal() {
  // Remove existing modal if any
  const existing = document.querySelector("#aliexpress-tracker-upgrade-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "aliexpress-tracker-upgrade-modal";
  modal.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: fadeIn 0.2s ease;
    ">
      <div style="
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
      ">
        <div style="font-size: 64px; margin-bottom: 16px;">🚀</div>
        <h2 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">
          Upgrade to Premium
        </h2>
        <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">
          You've reached the free limit of <strong>5 products</strong>.<br>
          Upgrade to track <strong>unlimited products</strong>!
        </p>
        
        <div style="
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        ">
          <div style="font-size: 32px; font-weight: 700; color: #ea580c;">
            $3 <span style="font-size: 14px; font-weight: 400; color: #9a3412;">one-time</span>
          </div>
          <div style="font-size: 12px; color: #9a3412;">Pay once, use forever!</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="upgrade-btn" style="
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
          ">
            🛒 Get Premium
          </button>
          <button id="close-modal-btn" style="
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

        <p style="font-size: 11px; color: #9ca3af; margin-top: 16px;">
          Already have a key? Go to Dashboard → Premium to activate
        </p>
      </div>
    </div>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(modal);

  // Button handlers
  document.getElementById("upgrade-btn")?.addEventListener("click", () => {
    // Replace with your actual LemonSqueezy store URL
    window.open(
      "https://pricetrackerr.lemonsqueezy.com/checkout/buy/4a86e7a2-ab7e-4e2e-b1be-b3c64c1ff4d1",
      "_blank",
    );
    modal.remove();
  });

  document.getElementById("close-modal-btn")?.addEventListener("click", () => {
    modal.remove();
  });

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal.firstElementChild) {
      modal.remove();
    }
  });
}

async function handleTrackClick() {
  const button = document.querySelector("#aliexpress-tracker-btn");
  if (!button) return;

  const productData = extractProductData();

  if (!productData || productData.price === 0) {
    button.innerHTML = "⚠️ Could not get price";
    button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;

    setTimeout(() => {
      button.innerHTML = "🔍 Track Price";
      button.style.cssText = buttonStyles.button;
    }, 2000);
    return;
  }

  // Loading state
  button.innerHTML = "⏳ Tracking...";
  button.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TRACK_PRODUCT",
      data: productData,
    });

    console.log("Track response:", response);

    if (response?.success) {
      button.innerHTML = "✅ Tracking!";
      button.style.cssText = buttonStyles.button + buttonStyles.buttonTracked;

      // Show success message with count
      const remaining = response.limit - response.currentCount;
      if (!response.isPro && remaining <= 2) {
        showToast(`✅ Tracked! ${remaining} free slots left`, "warning");
      } else {
        showToast("✅ Product added to tracking!", "success");
      }
    } else if (response?.error === "limit_reached") {
      // ✅ SHOW UPGRADE MODAL
      button.innerHTML = "🔒 Limit Reached";
      button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;
      button.disabled = false;

      showUpgradeModal();

      setTimeout(() => {
        button.innerHTML = "🔍 Track Price";
        button.style.cssText = buttonStyles.button;
      }, 3000);
    } else {
      button.innerHTML = "⚠️ " + (response?.error || "Already tracked");
      button.style.cssText = buttonStyles.button + buttonStyles.buttonWarning;

      setTimeout(() => {
        if (response?.error === "Already tracked") {
          button.innerHTML = "✅ Tracking";
          button.style.cssText =
            buttonStyles.button + buttonStyles.buttonTracked;
          button.disabled = true;
        } else {
          button.innerHTML = "🔍 Track Price";
          button.style.cssText = buttonStyles.button;
          button.disabled = false;
        }
      }, 2000);
    }
  } catch (error) {
    console.error("Error tracking product:", error);
    button.innerHTML = "❌ Error";
    button.style.cssText = buttonStyles.button + buttonStyles.buttonError;
    button.disabled = false;

    setTimeout(() => {
      button.innerHTML = "🔍 Track Price";
      button.style.cssText = buttonStyles.button;
    }, 2000);
  }
}

// ============================================
// PRICE CHECK (When revisiting a tracked product)
// ============================================

async function checkForPriceChanges() {
  const productData = extractProductData();
  if (!productData || productData.price === 0) return;

  try {
    console.log("🔍 Checking price:", productData.price);

    // ✅ Show checking indicator
    showToast("🔍 Checking price...", "info");

    const response = await chrome.runtime.sendMessage({
      type: "CHECK_PRICE",
      data: productData,
    });

    console.log("📥 Price check response:", response);

    if (response?.priceDropped) {
      console.log(
        `🎉 Price dropped! ${response.oldPrice} → ${response.newPrice}`,
      );
      showPriceDropBanner(response);
      showToast(
        `🎉 Price dropped ${response.savings}%! Check your alerts.`,
        "success",
      );
    } else if (response?.priceChanged) {
      console.log(
        `📈 Price changed: ${response.oldPrice} → ${response.newPrice}`,
      );
      if (response.newPrice > response.oldPrice) {
        showToast(
          `📈 Price increased to ${productData.currency}${response.newPrice}`,
          "warning",
        );
      }
    } else if (response?.tracked === false) {
      // Product not tracked, do nothing
      console.log("ℹ️ Product not in tracking list");
    } else {
      // Price unchanged
      console.log("✅ Price unchanged");
      showToast("✅ Price checked - no change", "info");
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

  const colors = {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  };

  const toast = document.createElement("div");
  toast.id = "aliexpress-tracker-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    z-index: 2147483647;
    padding: 12px 20px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    max-width: 300px;
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
      <span style="font-size: 32px;">🎉</span>
      <div>
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">Price Dropped!</div>
        <div style="font-size: 14px;">
          <span style="text-decoration: line-through; opacity: 0.7;">${data.currency || "$"}${data.oldPrice}</span>
          <span style="margin: 0 8px;">→</span>
          <span style="font-weight: 700; font-size: 18px;">${data.currency || "$"}${data.newPrice}</span>
          <span style="background: white; color: #10B981; padding: 2px 8px; border-radius: 20px; margin-left: 10px; font-weight: 600;">
            -${data.savings}%
          </span>
        </div>
      </div>
      <button id="aliexpress-tracker-banner-close" style="
        margin-left: auto;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    padding: 20px 24px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    border-radius: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
    animation: slideDown 0.4s ease;
    max-width: 400px;
  `;

  // Add animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(banner);

  // Close button
  document
    .getElementById("aliexpress-tracker-banner-close")
    ?.addEventListener("click", () => {
      banner.remove();
    });

  // Auto-hide after 10 seconds
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

  // Create track button
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
