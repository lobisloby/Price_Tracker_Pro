// src/utils/storage.js

/**
 * Save data to Chrome storage
 */
export const saveToStorage = async (key, data) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: data }, () => {
      resolve(true);
    });
  });
};

/**
 * Get data from Chrome storage
 */
export const getFromStorage = async (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
};

/**
 * Remove data from Chrome storage
 */
export const removeFromStorage = async (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      resolve(true);
    });
  });
};

/**
 * Get all stored products
 */
export const getProducts = async () => {
  const products = await getFromStorage('products');
  return products || [];
};

/**
 * Save a new product
 */
export const saveProduct = async (product) => {
  const products = await getProducts();
  products.push({
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });
  await saveToStorage('products', products);
  return products;
};