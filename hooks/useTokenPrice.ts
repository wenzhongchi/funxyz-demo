import { useCallback, useEffect, useState } from 'react';
import { getAssetPriceInfo } from '@funkit/api-base';

import { API_KEY } from '@config/constant';
import { TOKEN_INFO, TokenSymbol } from '@config/token';
import { TokenInfo } from '@type/token';

export const useTokenPrice = (symbol: TokenSymbol) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const info = await getAssetPriceInfo({
        chainId: TOKEN_INFO[symbol].chainId,
        assetTokenAddress: TOKEN_INFO[symbol].address,
        apiKey: API_KEY,
      });

      // Ensure returned info contains priceUSD field
      const tokenInfo = {
        ...info,
        priceUSD: String(info.unitPrice || '1.0'), // Assuming unitPrice is the price field, otherwise default to 1
      } satisfies TokenInfo;

      setTokenInfo(tokenInfo);
    } catch (error) {
      console.error(`Failed to fetch ${symbol} price:`, error);
      setError(error instanceof Error ? error : new Error('Failed to fetch token price'));
      // Return default price data
      setTokenInfo({
        amount: 0,
        total: 0,
        unitPrice: 0,
        priceUSD: '0',
      });
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchPrice();

    // Set up an interval to refresh the price every x seconds
    const intervalId = setInterval(fetchPrice, 6000);

    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchPrice, symbol]);

  return { tokenInfo, isLoading, error, refetch: fetchPrice };
};
