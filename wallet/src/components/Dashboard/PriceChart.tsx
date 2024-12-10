import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const timeWindows = {
  '1H': '1',
  '24H': '1',
  '1W': '7',
  '1M': '30',
  '1Y': '365',
  'All': 'max'
};

const currencySymbols = {
  usd: '$',
  inr: '₹'
};

const data = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 43500 },
  { time: '08:00', price: 43000 },
  { time: '12:00', price: 44000 },
  { time: '16:00', price: 45000 },
  { time: '20:00', price: 44500 },
  { time: '24:00', price: 46000 },
];

const timeRanges = ['24H', '7D', '1M', '3M', '1Y', 'ALL'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1B23] border border-[rgba(255,255,255,0.1)] p-3 rounded-lg backdrop-blur-xl">
        <p className="text-[#A0AEC0] text-sm">{label}</p>
        <p className="text-white font-medium">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [chartData, setChartData] = useState<{ labels: string[], prices: number[] }>({
    labels: [],
    prices: []
  });
  const [selectedTime, setSelectedTime] = useState<string>('24H');
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'inr'>('usd');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPriceData = async (timeWindow: string, currency: string) => {
    try {
      setLoading(true);
      const days = timeWindows[timeWindow as keyof typeof timeWindows];
      
      // Fetch historical data
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=${currency}&days=${days}&interval=hourly`
      );
      const data = await response.json();

      // Process historical data
      const formattedData = data.prices.map((item: [number, number]) => ({
        time: new Date(item[0]).toLocaleString(),
        price: item[1]
      }));

      setChartData({
        labels: formattedData.map(item => item.time),
        prices: formattedData.map(item => item.price)
      });

      // Update current price
      const currentDataResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency}&include_24hr_change=true`
      );
      const currentData = await currentDataResponse.json();
      setCurrentPrice(currentData.ethereum[currency]);
      setPriceChange(currentData.ethereum[`${currency}_24h_change`]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching price data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData(selectedTime, selectedCurrency);
    const interval = setInterval(() => {
      fetchPriceData(selectedTime, selectedCurrency);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedTime, selectedCurrency]);

  // Format data for the chart
  const formattedData = chartData.labels.map((label, index) => ({
    time: label,
    price: chartData.prices[index]
  }));

  return (
    <div className="bg-[#1A1B23] rounded-xl p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Price Chart</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              {currencySymbols[selectedCurrency]}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {Object.keys(timeWindows).map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`px-3 py-1 rounded-lg ${
                selectedTime === time
                  ? 'bg-[#8A2BE2] text-white'
                  : 'bg-[#2A2D3A] text-gray-400 hover:bg-[#3A3D4A]'
              }`}
            >
              {time}
            </button>
          ))}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as 'usd' | 'inr')}
            className="bg-[#2A2D3A] text-white rounded-lg px-3 py-1 ml-2"
          >
            <option value="usd">USD</option>
            <option value="inr">INR</option>
          </select>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <defs>
              <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A2BE2" stopOpacity={1}/>
                <stop offset="95%" stopColor="#B24BF3" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="url(#lineColor)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
