// src/dashboard/hooks/useProducts.js
// ✅ LOCAL STORAGE ONLY - No sync

import { useState, useEffect, useCallback } from "react";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products from local storage
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof chrome !== "undefined" && chrome.storage) {
        return new Promise((resolve) => {
          chrome.storage.local.get(["products"], (result) => {
            console.log("📦 Loaded products:", result.products?.length || 0);
            const prods = result.products || [];
            setProducts(prods);
            setLoading(false);
            resolve(prods);
          });
        });
      } else {
        // Dev mode - empty array
        console.log("⚠️ Dev mode - no Chrome storage available");
        setProducts([]);
        setLoading(false);
        return [];
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error loading products:", err);
      return [];
    }
  }, []);

  // Listen for storage changes (auto-update when data changes)
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      const handleStorageChange = (changes, areaName) => {
        if (areaName === "local" && changes.products) {
          console.log("🔄 Products changed in storage, updating...");
          setProducts(changes.products.newValue || []);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log("🚀 Loading products...");
    loadProducts();
  }, [loadProducts]);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    try {
      console.log("🗑️ Deleting product:", productId);

      if (typeof chrome !== "undefined" && chrome.runtime) {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: "DELETE_PRODUCT", productId },
            (response) => {
              if (response?.success) {
                setProducts((prev) => prev.filter((p) => p.id !== productId));
                resolve({ success: true });
              } else {
                resolve({ success: false, error: response?.error });
              }
            }
          );
        });
      }

      // Fallback for dev mode
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting product:", err);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete all products
  const deleteAllProducts = useCallback(async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({ products: [] });
        
        // Also update stats
        const { stats } = await chrome.storage.local.get(["stats"]);
        await chrome.storage.local.set({
          stats: { ...stats, totalTracked: 0 },
        });
      }
      setProducts([]);
      return { success: true };
    } catch (err) {
      console.error("Error deleting all products:", err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    products,
    loading,
    error,
    refresh: loadProducts,
    deleteProduct,
    deleteAllProducts,
  };
}