import { useEffect, useState } from 'react';
import { getAssetPriceInfo } from '@funkit/api-base';

import { COIN_INFO, CoinName } from '@config/coin';
import { API_KEY } from '@config/constant';
import { TokenInfo } from '@type/token';

export const useTokenPrice = () => {
  const [tokenInfo, setTokenInfo] = useState<Map<CoinName, TokenInfo>>(new Map());

  const fetchPrice = async (coinName: CoinName) => {
    try {
      const info = await getAssetPriceInfo({
        chainId: COIN_INFO[coinName].chainId,
        assetTokenAddress: COIN_INFO[coinName].address,
        apiKey: API_KEY,
      });

      // Ensure returned info contains priceUSD field
      return {
        ...info,
        priceUSD: String(info.unitPrice || '1.0'), // Assuming unitPrice is the price field, otherwise default to 1
      } satisfies TokenInfo;
    } catch (error) {
      console.error(`Failed to fetch ${coinName} price:`, error);
      // Return default price data
      return {
        amount: 0,
        total: 0,
        unitPrice: 0,
        priceUSD: '0',
      } satisfies TokenInfo;
    }
  };

  useEffect(() => {
    const coinNames = Object.keys(COIN_INFO) as CoinName[];
    Promise.all(coinNames.map(fetchPrice)).then((tokenInfos) => {
      setTokenInfo(new Map(tokenInfos.map((tokenInfo, index) => [coinNames[index], tokenInfo])));
    });
  }, []);

  return { tokenInfo };
};
