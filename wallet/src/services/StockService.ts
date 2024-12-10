import axios from 'axios';

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface StockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class StockService {
  static async getStockData(symbol: string): Promise<StockData[]> {
    try {
      // Validate inputs
      if (!symbol) {
        throw new Error('Stock symbol is required');
      }

      if (!FINNHUB_API_KEY) {
        throw new Error('Finnhub API key is not configured. Please set NEXT_PUBLIC_FINNHUB_API_KEY in your environment variables.');
      }

      // Log the request for debugging
      console.log(`Fetching stock data for symbol: ${symbol}`);

      // Fetch historical data
      const historicalResponse = await axios.get(`${BASE_URL}/stock/candle`, {
        params: {
          symbol: symbol.toUpperCase(),
          resolution: 'D', // Daily resolution
          from: Math.floor(Date.now() / 1000 - 365 * 24 * 60 * 60), // Last year
          to: Math.floor(Date.now() / 1000),
          token: FINNHUB_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });

      // Validate response
      if (!historicalResponse.data || historicalResponse.data.s !== 'ok') {
        throw new Error('Invalid response from Finnhub API');
      }

      const { c: closes, h: highs, l: lows, o: opens, v: volumes, t: timestamps } = historicalResponse.data;

      // Transform data
      const stockData: StockData[] = timestamps.map((timestamp: number, index: number) => ({
        symbol,
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: opens[index],
        high: highs[index],
        low: lows[index],
        close: closes[index],
        volume: volumes[index]
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return stockData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout: The API took too long to respond');
        }
        if (error.response) {
          throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
        } else if (error.request) {
          throw new Error('No response received from Finnhub API');
        }
      }
      throw error;
    }
  }

  static getDefaultStocks() {
    return [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
      { symbol: 'V', name: 'Visa Inc.' },
      { symbol: 'WMT', name: 'Walmart Inc.' }
    ];
  }
}
