import { create } from 'zustand';
import { StockService, StockData } from '@/services/StockService';

interface StockState {
  stocks: { [symbol: string]: StockData[] };
  selectedStock: string | null;
  isLoading: boolean;
  error: string | null;
  fetchStockData: (symbol: string) => Promise<void>;
  setSelectedStock: (symbol: string) => void;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks: {},
  selectedStock: null,
  isLoading: false,
  error: null,

  fetchStockData: async (symbol: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await StockService.getStockData(symbol);
      set((state) => ({
        stocks: {
          ...state.stocks,
          [symbol]: data
        }
      }));
    } catch (error) {
      set({ error: 'Failed to fetch stock data: ' + (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedStock: (symbol: string) => {
    set({ selectedStock: symbol });
  }
}));
