// src/dashboard/pages/Products.jsx
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

function Products({ onProductCountChange, onAnalyze }) {
  const { products, loading, deleteProduct, deleteAllProducts, refresh } =
    useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  useEffect(() => {
    onProductCountChange?.(products.length);
  }, [products.length, onProductCountChange]);

  // Handle delete
  const handleDelete = async (productId) => {
    const result = await deleteProduct(productId);
    if (!result.success) {
      alert("Failed to delete product: " + result.error);
    }
  };

  // Handle delete all
  const handleDeleteAll = async () => {
    const result = await deleteAllProducts();
    if (result.success) {
      setShowDeleteAll(false);
    } else {
      alert("Failed to delete all products");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white min-w-[160px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Refresh */}
          <button
            onClick={refresh}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Products Count & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            📦 All Products
          </h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {products.length > 0 && (
          <button
            onClick={() => setShowDeleteAll(true)}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ Delete All
          </button>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete All Products?
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all {products.length} tracked
                products. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteAll(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Yes, Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            Loading products...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">{searchTerm ? "🔍" : "📭"}</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? "No products found" : "No products yet"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? "Try a different search term."
                : 'Visit AliExpress and click "Track Price" on any product.'}
            </p>
            {!searchTerm && (
              <a
                href="https://www.aliexpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                🛒 Go to AliExpress
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onAnalyze={onAnalyze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
