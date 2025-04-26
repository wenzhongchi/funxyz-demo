export const COIN_INFO = {
  usdc: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: '1',
  },
  usdt: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    chainId: '137',
  },
  eth: {
    address: '0x0000000000000000000000000000000000000000',
    chainId: '8453',
  },
  wbtc: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    chainId: '1',
  },
};

export const COIN_DECIMALS: Record<string, number> = {
  USDT: 6,
  USDC: 6,
  ETH: 18,
  WBTC: 18,
};

export type CoinName = keyof typeof COIN_INFO;
