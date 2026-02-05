// src/dashboard/components/ProductCard.jsx
import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Trash2,
  Loader2,
  X
} from 'lucide-react';

function ProductCard({ product, onDelete, onAnalyze }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.(product.id);
    } catch (error) {
      console.error('Error deleting:', error);
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  // Calculate price change percentage
  const getPriceChange = () => {
    if (!product.priceHistory || product.priceHistory.length < 2) return null;
    
    const firstPrice = product.priceHistory[0].price;
    const currentPrice = product.price;
    const changePercent = ((firstPrice - currentPrice) / firstPrice * 100).toFixed(1);
    
    return {
      percent: Math.abs(changePercent),
      direction: currentPrice < firstPrice ? 'down' : currentPrice > firstPrice ? 'up' : 'same',
    };
  };

  const priceChange = getPriceChange();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="text-center p-4">
            <p className="text-gray-700 font-medium mb-3">Delete this product?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleCancelDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Image */}
      <a 
        href={product.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <img
          src={product.image || 'https://via.placeholder.com/64?text=No+Image'}
          alt={product.title}
          className="w-16 h-16 rounded-lg object-cover hover:scale-105 transition-transform border border-gray-200"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/64?text=No+Image';
          }}
        />
      </a>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-800 hover:text-orange-500 transition-colors line-clamp-2 block"
        >
          {product.title}
        </a>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-white bg-orange-500 px-2 py-0.5 rounded font-medium">
            AliExpress
          </span>
          <span className="text-xs text-gray-400">
            Added {formatDate(product.createdAt)}
          </span>
          {product.priceHistory && (
            <span className="text-xs text-gray-400">
              • {product.priceHistory.length} price checks
            </span>
          )}
        </div>
      </div>

      {/* Price & Change */}
      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-orange-500">
          {product.currency}{product.price?.toFixed(2)}
        </div>
        {priceChange && priceChange.direction !== 'same' && (
          <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${
            priceChange.direction === 'down' ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {priceChange.direction === 'down' ? (
              <TrendingDown size={14} />
            ) : (
              <TrendingUp size={14} />
            )}
            <span>{priceChange.percent}%</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onAnalyze?.(product)}
          className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors text-gray-400 hover:text-orange-500"
          title="View price history"
        >
          <BarChart3 size={18} />
        </button>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 hover:bg-blue-100 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
          title="Open product page"
        >
          <ExternalLink size={18} />
        </a>
        <button
          onClick={handleDeleteClick}
          className="p-2.5 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
          title="Delete product"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ProductCard;