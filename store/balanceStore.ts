import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import BigNumber from 'bignumber.js';

import { TOKEN_INFO, TokenSymbol } from '@config/token';
import { TokenInfo } from '@type/token';
import { getTokenDecimals } from '@utils/utils';

// Token balance interface
interface TokenBalance {
  // Balance as string to avoid precision issues
  balance: string;
  // Decimal places
  decimals: number;
}

interface BalanceStore {
  // User token balance records
  balances: Record<TokenSymbol, TokenBalance>;
  tokenInfo: Record<TokenSymbol, TokenInfo>;
  // Method to get balance
  getBalance: (symbol: TokenSymbol) => string;
  // Method to set balance
  setBalance: (symbol: TokenSymbol, amount: string) => void;
  // Whether the swap is in progress
  isSwapping: boolean;
  setIsSwapping: (isSwapping: boolean) => void;
  // Execute swap operation
  swap: (
    sellToken: TokenSymbol,
    receiveToken: TokenSymbol,
    sellAmount: string,
    tokenPrices: Record<TokenSymbol, TokenInfo>
  ) => Promise<{ receiveAmount: string; success: boolean; message?: string }>;

  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  // Method to get token info
  getTokenInfo: (symbol: TokenSymbol) => TokenInfo | undefined;
  // Method to set token info
  setTokenInfo: (symbol: TokenSymbol, info: TokenInfo) => void;
}

//  usdt = 1000， usdc = 1000, eth = 2, wbtc = 0.01
const defaultBalances = {
  usdt: '1000000000', // 1000 * 10^6
  usdc: '1000000000', // 1000 * 10^6
  eth: '2000000000000000000', // 2 * 10^18
  wbtc: '10000000000000000', // 0.01 * 10^18
};

// Initial balances
const DEFAULT_BALANCES: Record<TokenSymbol, TokenBalance> = Object.keys(TOKEN_INFO).reduce(
  (acc, tokenSymbol) => {
    const token = tokenSymbol as TokenSymbol;
    return {
      ...acc,
      [token]: {
        balance: defaultBalances[token],
        decimals: getTokenDecimals(token),
      },
    };
  },
  {} as Record<TokenSymbol, TokenBalance>
);

// Initial token info
const DEFAULT_TOKEN_INFO: Record<TokenSymbol, TokenInfo> = Object.keys(TOKEN_INFO).reduce(
  (acc, tokenSymbol) => {
    const token = tokenSymbol as TokenSymbol;
    return {
      ...acc,
      [token]: {
        amount: 0,
        total: 0,
        unitPrice: 0,
        priceUSD: '0',
      },
    };
  },
  {} as Record<TokenSymbol, TokenInfo>
);

export const useBalanceStore = create<BalanceStore>()(
  persist(
    (set, get) => ({
      balances: DEFAULT_BALANCES,
      tokenInfo: DEFAULT_TOKEN_INFO,
      isSwapping: false,
      setIsSwapping: (isSwapping: boolean) => set({ isSwapping }),

      getBalance: (tokenSymbol: TokenSymbol) => {
        const { balances } = get();
        if (!balances[tokenSymbol]) return '0';

        return balances[tokenSymbol].balance;
      },

      setBalance: (tokenSymbol: TokenSymbol, amount: string) => {
        const { balances } = get();
        const decimals = balances[tokenSymbol].decimals;

        try {
          set({
            balances: {
              ...balances,
              [tokenSymbol]: {
                balance: amount,
                decimals,
              },
            },
          });
        } catch (e) {
          console.error('Error setting balance:', e);
        }
      },

      swap: async (
        sellToken: TokenSymbol,
        receiveToken: TokenSymbol,
        sellAmount: string,
        tokenPrices: Record<TokenSymbol, TokenInfo>
      ) => {
        const { balances, setBalance } = get();

        // Check if tokens exist
        if (!balances[sellToken] || !balances[receiveToken]) {
          return { receiveAmount: '0', success: false, message: 'Token does not exist' };
        }

        // Get token price information
        const sellTokenInfo = tokenPrices[sellToken];
        const receiveTokenInfo = tokenPrices[receiveToken];

        if (!sellTokenInfo || !receiveTokenInfo) {
          return { receiveAmount: '0', success: false, message: 'Cannot get token prices' };
        }

        // Get token decimals
        const sellTokenDecimals = balances[sellToken].decimals;
        const receiveTokenDecimals = balances[receiveToken].decimals;

        // Convert sell amount to precise value (wei)
        const sellAmountInWei = new BigNumber(sellAmount).times(10 ** sellTokenDecimals);

        // Check if balance is sufficient
        const sellTokenBalance = balances[sellToken].balance;

        if (new BigNumber(sellTokenBalance).isLessThan(new BigNumber(sellAmount))) {
          return { receiveAmount: '0', success: false, message: 'Insufficient balance' };
        }

        set({ isSwapping: true });
        // TODO: remove this, demo purpose only
        // simulate the swap process
        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          // Convert values to BigNumber for precise calculations
          const sellTokenPriceBN = new BigNumber(sellTokenInfo.priceUSD);
          const receiveTokenPriceBN = new BigNumber(receiveTokenInfo.priceUSD);

          // Calculate the exchange rate: sell token price / receive token price
          const tokenExchangeRate = sellTokenPriceBN.dividedBy(receiveTokenPriceBN);

          // Calculate receive amount in wei
          const receiveAmountInWei = sellAmountInWei
            .dividedBy(10 ** sellTokenDecimals)
            .times(tokenExchangeRate)
            .times(10 ** receiveTokenDecimals);

          // Limit the result to the maximum number of decimals for the receive token
          const limitedReceiveAmountInWei = receiveAmountInWei.toFixed(0, BigNumber.ROUND_DOWN);

          // Update balances
          const sellTokenBalanceBN = new BigNumber(sellTokenBalance);
          const newSellTokenBalance = sellTokenBalanceBN.minus(sellAmountInWei).toString();

          const receiveTokenBalance = balances[receiveToken].balance;
          const receiveTokenBalanceBN = new BigNumber(receiveTokenBalance);

          const newReceiveTokenBalance = receiveTokenBalanceBN
            .plus(limitedReceiveAmountInWei)
            .toString();

          // Save new balances
          setBalance(sellToken, newSellTokenBalance);
          setBalance(receiveToken, newReceiveTokenBalance);

          set({ isSwapping: false });
          return {
            receiveAmount: new BigNumber(limitedReceiveAmountInWei)
              .dividedBy(10 ** receiveTokenDecimals)
              .toString(),
            success: true,
          };
        } catch (error) {
          console.error('Error during swap calculation:', error);
          set({ isSwapping: false });
          return { receiveAmount: '0', success: false, message: 'Error calculating swap amounts' };
        }
      },

      hasHydrated: false,
      setHasHydrated(hasHydrated) {
        set({ hasHydrated });
      },
      getTokenInfo: (symbol: TokenSymbol) => {
        const { tokenInfo } = get();
        return tokenInfo[symbol];
      },
      setTokenInfo: (symbol: TokenSymbol, info: TokenInfo) => {
        const { tokenInfo } = get();
        set({
          tokenInfo: {
            ...tokenInfo,
            [symbol]: info,
          },
        });
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
