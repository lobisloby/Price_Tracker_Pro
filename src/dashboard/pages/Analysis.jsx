// src/dashboard/pages/Analysis.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import PriceChart from '../components/PriceChart';

function Analysis({ selectedProductId }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [selectedProductId, products]);

  const loadProducts = async () => {
    try {
      // Check if Chrome API exists
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['products']);
        const loadedProducts = result.products || [];
        setProducts(loadedProducts);
        
        // Select product based on selectedProductId, or default to first product
        if (selectedProductId) {
          const product = loadedProducts.find(p => p.id === selectedProductId);
          setSelectedProduct(product || loadedProducts[0] || null);
        } else if (loadedProducts.length > 0) {
          setSelectedProduct(loadedProducts[0]);
        }
      } else {
        // 🧪 DEV MODE: Use sample data for testing
        const sampleProducts = [
          {
            id: '1',
            title: 'Wireless Bluetooth Headphones - Sample Product',
            price: 29.99,
            currency: '$',
            image: 'https://via.placeholder.com/100',
            site: 'aliexpress',
            url: 'https://aliexpress.com/item/123.html',
            createdAt: new Date().toISOString(),
            priceHistory: [
              { price: 45.99, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 42.50, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 39.99, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 44.00, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 38.00, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 35.50, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 32.00, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 29.99, date: new Date().toISOString() },
            ],
          },
          {
            id: '2',
            title: 'USB-C Hub Adapter - Sample Product',
            price: 15.99,
            currency: '$',
            image: 'https://via.placeholder.com/100',
            site: 'aliexpress',
            url: 'https://aliexpress.com/item/456.html',
            createdAt: new Date().toISOString(),
            priceHistory: [
              { price: 22.00, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 19.99, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 18.50, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
              { price: 15.99, date: new Date().toISOString() },
            ],
          },
        ];
        
        setProducts(sampleProducts);
        if (selectedProductId) {
          const product = sampleProducts.find(p => p.id === selectedProductId);
          setSelectedProduct(product || sampleProducts[0]);
        } else {
          setSelectedProduct(sampleProducts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 flex items-center gap-2">
          <Loader2 size={24} className="animate-spin text-orange-500" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Selector */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product to Analyze
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const product = products.find((p) => p.id === e.target.value);
            setSelectedProduct(product);
          }}
        >
          {products.length === 0 ? (
            <option value="">No products tracked yet</option>
          ) : (
            products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title?.substring(0, 50)}...
              </option>
            ))
          )}
        </select>
      </div>

      {/* Product Info */}
      {selectedProduct && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={selectedProduct.image || 'https://via.placeholder.com/80'}
              alt={selectedProduct.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">
                {selectedProduct.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Current Price: 
                <span className="text-lg font-bold text-orange-500 ml-2">
                  {selectedProduct.currency}{selectedProduct.price}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      {selectedProduct && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            Price History
          </h2>
          <PriceChart 
            priceHistory={selectedProduct.priceHistory} 
            currency={selectedProduct.currency} 
          />
        </div>
      )}

      {/* Recommendation */}
      {selectedProduct && selectedProduct.priceHistory?.length > 1 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-orange-500" />
            Recommendation
          </h2>
          {(() => {
            const prices = selectedProduct.priceHistory.map(h => h.price);
            const currentPrice = selectedProduct.price;
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const minPrice = Math.min(...prices);
            
            if (currentPrice <= minPrice) {
              return (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-700 font-medium">
                    This is the LOWEST price recorded! Great time to buy!
                  </p>
                </div>
              );
            } else if (currentPrice < avgPrice) {
              return (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-700 font-medium">
                    Price is below average. Good time to buy!
                  </p>
                </div>
              );
            } else {
              return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-700 font-medium">
                    Price is above average. Consider waiting for a drop.
                  </p>
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}

export default Analysis;