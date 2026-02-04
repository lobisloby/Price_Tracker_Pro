// src/services/n8n.js
import { N8N_WEBHOOKS } from '../utils/constants.js';

/**
 * Get user ID from storage
 */
async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId'], (result) => {
      if (result.userId) {
        resolve(result.userId);
      } else {
        const newUserId = crypto.randomUUID();
        chrome.storage.local.set({ userId: newUserId }, () => {
          resolve(newUserId);
        });
      }
    });
  });
}

/**
 * Send a new product to n8n for tracking
 */
export async function trackProduct(productData) {
  try {
    const userId = await getUserId();
    
    const response = await fetch(N8N_WEBHOOKS.addProduct, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        productId: productData.id || Date.now().toString(),
        url: productData.url,
        title: productData.title,
        price: productData.price,
        currency: productData.currency || '$',
        image: productData.image || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking product:', error);
    throw error;
  }
}

/**
 * Remove a product from tracking
 */
export async function removeProduct(productId) {
  try {
    const response = await fetch(`${N8N_WEBHOOKS.deleteProduct}?productId=${productId}`, {
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    console.error('Error removing product:', error);
    throw error;
  }
}

/**
 * Sync all data from database
 */
export async function syncFromServer() {
  try {
    const userId = await getUserId();
    
    const response = await fetch(`${N8N_WEBHOOKS.sync}?userId=${userId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing:', error);
    throw error;
  }
}

/**
 * Get all tracked products (from sync)
 */
export async function getTrackedProducts() {
  try {
    const data = await syncFromServer();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get price history for a product (from local storage)
 */
export async function getPriceHistory(productId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['products'], (result) => {
      const products = result.products || [];
      const product = products.find(p => p.id === productId);
      resolve(product?.priceHistory || []);
    });
  });
}