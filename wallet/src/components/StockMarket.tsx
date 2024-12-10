'use client';

import { useEffect, useRef, useState } from 'react';
import { useStockStore } from '@/store/stockStore';
import { StockService } from '@/services/StockService';
import Chart from 'chart.js/auto';

const TIME_PERIODS = [
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Month', value: '3M' },
  { label: '6 Month', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: '5 Year', value: '5Y' },
  { label: 'All', value: 'ALL' },
];

export default function StockMarket() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1W');
  const { stocks, selectedStock, isLoading, error, fetchStockData, setSelectedStock } = useStockStore();

  useEffect(() => {
    // Fetch data for default stocks
    const defaultStocks = StockService.getDefaultStocks();
    defaultStocks.forEach(stock => {
      fetchStockData(stock.symbol);
    });
    
    // Set first stock as selected
    if (defaultStocks.length > 0) {
      setSelectedStock(defaultStocks[0].symbol);
    }
  }, []);

  useEffect(() => {
    if (!selectedStock || !stocks[selectedStock] || !chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const stockData = stocks[selectedStock];
    const ctx = chartRef.current.getContext('2d');

    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(136, 42, 190, 0.2)');
    gradient.addColorStop(1, 'rgba(136, 42, 190, 0)');

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stockData.map(data => data.date),
        datasets: [
          {
            label: 'Price',
            data: stockData.map(data => data.close),
            borderColor: 'rgb(136, 42, 190)',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1A1B23',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#2A2A3C',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
              label: (item) => {
                return `$${item.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'white',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(255,255,255,0.1)'
            },
            border: {
              display: false
            },
            ticks: {
              color: 'white',
              callback: (value) => `$${value}`
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        hover: {
          intersect: false,
          mode: 'index'
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedStock, stocks]);

  const getCurrentStock = () => {
    if (!selectedStock || !stocks[selectedStock]) return null;
    return StockService.getDefaultStocks().find(s => s.symbol === selectedStock);
  };

  const getStockPrice = () => {
    if (!selectedStock || !stocks[selectedStock]) return null;
    const latestData = stocks[selectedStock][0];
    return latestData.close.toFixed(2);
  };

  const getPercentageChange = () => {
    if (!selectedStock || !stocks[selectedStock]) return null;
    const data = stocks[selectedStock];
    const latestPrice = data[0].close;
    const previousPrice = data[1].close;
    const change = ((latestPrice - previousPrice) / previousPrice) * 100;
    return change.toFixed(2);
  };

  return (
    <div className="p-6 bg-[#1A1B23] rounded-xl shadow-xl text-white">
      {/* Stock Selection and Price Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <select
            value={selectedStock || ''}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:ring-0 p-0 text-white"
          >
            {StockService.getDefaultStocks().map((stock) => (
              <option key={stock.symbol} value={stock.symbol} className="bg-[#1A1B23] text-white">
                {stock.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-400">{getCurrentStock()?.symbol}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${getStockPrice()}</div>
          <div className={`text-sm ${
            Number(getPercentageChange()) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {Number(getPercentageChange()) >= 0 ? '↑' : '↓'} {Math.abs(Number(getPercentageChange()))}%
          </div>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex space-x-2 mb-6">
        {TIME_PERIODS.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedPeriod === period.value
                ? 'bg-[#8A2BE2] text-white'
                : 'bg-[#2A2A3C] text-gray-400 hover:bg-[#3A3A4C]'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="h-[400px] w-full">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {selectedStock && stocks[selectedStock] && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-[#2A2A3C] rounded-lg">
            <div className="text-sm text-gray-400">Open</div>
            <div className="text-lg font-semibold">
              ${stocks[selectedStock][0].open.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-[#2A2A3C] rounded-lg">
            <div className="text-sm text-gray-400">High</div>
            <div className="text-lg font-semibold">
              ${stocks[selectedStock][0].high.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-[#2A2A3C] rounded-lg">
            <div className="text-sm text-gray-400">Low</div>
            <div className="text-lg font-semibold">
              ${stocks[selectedStock][0].low.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-[#2A2A3C] rounded-lg">
            <div className="text-sm text-gray-400">Volume</div>
            <div className="text-lg font-semibold">
              {stocks[selectedStock][0].volume.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
