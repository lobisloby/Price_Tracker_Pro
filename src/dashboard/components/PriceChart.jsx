// src/dashboard/components/PriceChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function PriceChart({ priceHistory = [], currency = '$' }) {
  // No data state
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-3 text-orange-300" />
          <p className="font-medium">No price history yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Visit the product page to record prices
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const labels = priceHistory.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  const prices = priceHistory.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);

  const data = {
    labels,
    datasets: [
      {
        label: `Price (${currency})`,
        data: prices,
        borderColor: '#f97316', // Orange
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${currency}${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
      },
      y: {
        min: minPrice * 0.9,
        max: maxPrice * 1.1,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
          callback: (value) => `${currency}${value.toFixed(0)}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div>
      {/* Chart */}
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
      
      {/* Stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Lowest</p>
          <p className="text-lg font-bold text-emerald-500">
            {currency}{minPrice.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Average</p>
          <p className="text-lg font-bold text-gray-700">
            {currency}{avgPrice}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Highest</p>
          <p className="text-lg font-bold text-red-500">
            {currency}{maxPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceChart;