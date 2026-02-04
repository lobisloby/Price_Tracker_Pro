// src/utils/export.js

/**
 * Convert products array to CSV string
 */
export function productsToCSV(products) {
  if (!products || products.length === 0) {
    return null;
  }

  // CSV Headers
  const headers = [
    'ID',
    'Title',
    'Current Price',
    'Currency',
    'URL',
    'Site',
    'Tracked Date',
    'Last Checked',
    'Lowest Price',
    'Highest Price',
    'Price Checks',
  ];

  // Create rows
  const rows = products.map(product => {
    const prices = product.priceHistory?.map(h => h.price) || [product.price];
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    return [
      product.id,
      `"${(product.title || '').replace(/"/g, '""')}"`, // Escape quotes
      product.price?.toFixed(2) || '0.00',
      product.currency || '$',
      product.url || '',
      product.site || 'aliexpress',
      formatDate(product.createdAt),
      formatDate(product.lastChecked),
      lowestPrice.toFixed(2),
      highestPrice.toFixed(2),
      product.priceHistory?.length || 1,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Convert alerts array to CSV string
 */
export function alertsToCSV(alerts) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const headers = [
    'ID',
    'Product',
    'Type',
    'Old Price',
    'New Price',
    'Savings %',
    'Currency',
    'Date',
    'URL',
  ];

  const rows = alerts.map(alert => [
    alert.id,
    `"${(alert.productTitle || '').replace(/"/g, '""')}"`,
    alert.type || 'price_drop',
    alert.oldPrice?.toFixed(2) || '0.00',
    alert.newPrice?.toFixed(2) || '0.00',
    alert.savings || '0',
    alert.currency || '$',
    formatDate(alert.time),
    alert.url || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
  if (!csvContent) {
    alert('No data to export!');
    return false;
  }

  // Create blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  return true;
}

/**
 * Export products to CSV file
 */
export function exportProducts(products) {
  const csv = productsToCSV(products);
  const filename = `aliexpress-products-${getDateString()}.csv`;
  return downloadCSV(csv, filename);
}

/**
 * Export alerts to CSV file
 */
export function exportAlerts(alerts) {
  const csv = alertsToCSV(alerts);
  const filename = `aliexpress-alerts-${getDateString()}.csv`;
  return downloadCSV(csv, filename);
}

/**
 * Format date for CSV
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get current date string for filename
 */
function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}