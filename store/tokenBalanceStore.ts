import { CoinName, coinInfoData } from '@/config/coinConfig';
import { TokenInfo } from '@/types/token';
import { formatUnits, parseUnits } from 'ethers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ensureCorrectDecimals } from '@/lib/utils';
import { COIN_DECIMALS } from '@/lib/constants';

// Token balance interface
interface TokenBalance {
  // Balance as string to avoid precision issues
  balance: string;
  // Decimal places
  decimals: number;
}

interface TokenBalanceStore {
  // User token balance records
  balances: Record<CoinName, TokenBalance>;
  // Method to get balance
  getBalance: (coinName: CoinName) => string;
  // Method to set balance
  setBalance: (coinName: CoinName, amount: string) => void;
  // Whether the swap is in progress
  isSwapping: boolean;
  setIsSwapping: (isSwapping: boolean) => void;
  // Execute swap operation
  swap: (
    sellCoin: CoinName,
    buyCoin: CoinName,
    sellAmount: string,
    tokenPrices: Map<CoinName, TokenInfo>
  ) => Promise<{ buyAmount: string; success: boolean; message?: string }>;

  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

// Get decimal places for a coin
const getCoinDecimals = (coin: CoinName): number => {
  const coinUpperCase = coin.toUpperCase();
  return COIN_DECIMALS[coinUpperCase] || 18;
};

//  usdt = 1000， usdc = 1000, eth = 2, wbtc = 0.01
const defaultBalances = {
  usdt: '1000000000', // 1000 * 10^6
  usdc: '1000000000', // 1000 * 10^6
  eth: '2000000000000000000', // 2 * 10^18
  wbtc: '10000000000000000', // 0.01 * 10^18
};

// Initial balances
const DEFAULT_BALANCES: Record<CoinName, TokenBalance> = Object.keys(coinInfoData).reduce(
  (acc, coinName) => {
    const coin = coinName as CoinName;
    return {
      ...acc,
      [coin]: {
        balance: defaultBalances[coin],
        decimals: getCoinDecimals(coin),
      },
    };
  },
  {} as Record<CoinName, TokenBalance>
);

export const useTokenBalanceStore = create<TokenBalanceStore>()(
  persist(
    (set, get) => ({
      balances: DEFAULT_BALANCES,
      isSwapping: false,
      setIsSwapping: (isSwapping: boolean) => set({ isSwapping }),

      getBalance: (coinName: CoinName) => {
        const { balances } = get();
        if (!balances[coinName]) return '0';

        // Format to human-readable number
        return formatUnits(balances[coinName].balance, balances[coinName].decimals);
      },

      setBalance: (coinName: CoinName, amount: string) => {
        const { balances } = get();
        const decimals = balances[coinName]?.decimals || getCoinDecimals(coinName);

        try {
          // Ensure amount doesn't have more decimal places than the token supports
          const safeAmount = ensureCorrectDecimals(amount, decimals);
          
          // Convert to precise value with correct decimals
          const parsedAmount = parseUnits(safeAmount, decimals).toString();

          set({
            balances: {
              ...balances,
              [coinName]: {
                balance: parsedAmount,
                decimals,
              },
            },
          });
        } catch (e) {
          console.error('Invalid amount format', e);
        }
      },

      swap: async (
        sellCoin: CoinName,
        buyCoin: CoinName,
        sellAmount: string,
        tokenPrices: Map<CoinName, TokenInfo>
      ) => {
        const { balances, setBalance } = get();

        // Check if tokens exist
        if (!balances[sellCoin] || !balances[buyCoin]) {
          return { buyAmount: '0', success: false, message: 'Token does not exist' };
        }

        // Get token price information
        const sellTokenInfo = tokenPrices.get(sellCoin);
        const buyTokenInfo = tokenPrices.get(buyCoin);

        if (!sellTokenInfo || !buyTokenInfo) {
          return { buyAmount: '0', success: false, message: 'Cannot get token prices' };
        }

        // Check if balance is sufficient
        const sellBalance = get().getBalance(sellCoin);
        if (parseFloat(sellBalance) < parseFloat(sellAmount)) {
          return { buyAmount: '0', success: false, message: 'Insufficient balance' };
        }

        set({ isSwapping: true });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        // Calculate buy amount: sell amount * sell token price / buy token price
        const sellValue = parseFloat(sellAmount) * parseFloat(sellTokenInfo.priceUSD);
        const buyAmount = (sellValue / parseFloat(buyTokenInfo.priceUSD)).toString();

        // Ensure amounts have correct decimal places
        const sellDecimals = balances[sellCoin].decimals;
        const buyDecimals = balances[buyCoin].decimals;
        
        const safeSellAmount = ensureCorrectDecimals(sellAmount, sellDecimals);
        const safeBuyAmount = ensureCorrectDecimals(buyAmount, buyDecimals);

        // Update balances
        const newSellBalance = (parseFloat(sellBalance) - parseFloat(safeSellAmount)).toString();
        const oldBuyBalance = get().getBalance(buyCoin);
        const newBuyBalance = (parseFloat(oldBuyBalance) + parseFloat(safeBuyAmount)).toString();

        // Save new balances
        setBalance(sellCoin, newSellBalance);
        setBalance(buyCoin, newBuyBalance);

        set({ isSwapping: false });
        return { buyAmount: safeBuyAmount, success: true };
      },

      hasHydrated: false,
      setHasHydrated(hasHydrated) {
        set({ hasHydrated });
      },
    }),
    {
      name: 'token-balances',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
