import { apiKey, coinInfoData, CoinName } from '@/config/coinConfig';
import { TokenInfo } from '@/types/token';
import { getAssetPriceInfo } from '@funkit/api-base';
import { useEffect, useState } from 'react';

export const useTokenPrice = () => {
  const [tokenInfo, setTokenInfo] = useState<Map<CoinName, TokenInfo>>(new Map());

  const fetchPrice = async (coinName: CoinName) => {
    try {
      const info = await getAssetPriceInfo({
        chainId: coinInfoData[coinName].chainId,
        assetTokenAddress: coinInfoData[coinName].address,
        apiKey: apiKey,
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
    const coinNames = Object.keys(coinInfoData) as CoinName[];
    Promise.all(coinNames.map(fetchPrice)).then((tokenInfos) => {
      setTokenInfo(new Map(tokenInfos.map((tokenInfo, index) => [coinNames[index], tokenInfo])));
    });
  }, []);

  return { tokenInfo };
};
