'use client';

import React, { useState } from 'react';

import Layout from '@/components/layout/layout';
import Spin from '@/components/Spin';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { CoinName, coinInfoData } from '@/config/coinConfig';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { ensureCorrectDecimals, formatAmount, formatBalance } from '@/lib/utils';
import { useTokenBalanceStore } from '@/store/tokenBalanceStore';
import Image from 'next/image';

const SwapPage: React.FC = () => {
  const { tokenInfo } = useTokenPrice();
  const { getBalance, swap, hasHydrated, isSwapping } = useTokenBalanceStore();
  const { toast } = useToast();

  // Set default selected tokens
  const [sellCoin, setSellCoin] = useState<CoinName>('usdt');
  const [buyCoin, setBuyCoin] = useState<CoinName>('eth');

  // User input amounts
  const [sellAmount, setSellAmount] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');

  // Balance
  const sellBalance = getBalance(sellCoin);
  const buyBalance = getBalance(buyCoin);

  // Reset amounts when selecting tokens
  const handleSellCoinChange = (value: CoinName) => {
    setSellCoin(value);
    setSellAmount('');
    setBuyAmount('');
  };

  const handleBuyCoinChange = (value: CoinName) => {
    setBuyCoin(value);
    setSellAmount('');
    setBuyAmount('');
  };

  // Handle sell amount change, automatically calculate buy amount
  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellAmount(value);

    // If input is empty or no price info, set buy amount to empty
    if (!value || !tokenInfo.size) {
      setBuyAmount('');
      return;
    }

    try {
      // Calculate buy amount
      if (sellCoin && buyCoin) {
        const sellTokenInfo = tokenInfo.get(sellCoin);
        const buyTokenInfo = tokenInfo.get(buyCoin);

        if (sellTokenInfo && buyTokenInfo) {
          const sellValue = parseFloat(value) * parseFloat(sellTokenInfo.priceUSD);
          const calculatedBuyAmount = (sellValue / parseFloat(buyTokenInfo.priceUSD)).toString();

          // Limit decimal places to avoid conversion errors
          const safeBuyAmount = ensureCorrectDecimals(calculatedBuyAmount, 6);
          setBuyAmount(safeBuyAmount);
        }
      }
    } catch (e) {
      console.error('Error calculating buy amount', e);
    }
  };

  // Handle buy amount change, automatically calculate sell amount
  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBuyAmount(value);

    // If input is empty or no price info, set sell amount to empty
    if (!value || !tokenInfo.size) {
      setSellAmount('');
      return;
    }

    try {
      // Calculate sell amount
      if (sellCoin && buyCoin) {
        const sellTokenInfo = tokenInfo.get(sellCoin);
        const buyTokenInfo = tokenInfo.get(buyCoin);

        if (sellTokenInfo && buyTokenInfo) {
          const buyValue = parseFloat(value) * parseFloat(buyTokenInfo.priceUSD);
          const calculatedSellAmount = (buyValue / parseFloat(sellTokenInfo.priceUSD)).toString();

          // Limit decimal places to avoid conversion errors
          const safeSellAmount = ensureCorrectDecimals(calculatedSellAmount, 6);
          setSellAmount(safeSellAmount);
        }
      }
    } catch (e) {
      console.error('Error calculating sell amount', e);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast({
        title: 'Please enter a valid sell amount',
        variant: 'destructive',
      });
      return;
    }

    if (sellCoin === buyCoin) {
      toast({
        title: 'Cannot swap the same token',
        variant: 'destructive',
      });
      return;
    }

    // Ensure amount has proper decimal places
    const safeAmount = ensureCorrectDecimals(sellAmount, 18); // Use max precision
    const result = await swap(sellCoin, buyCoin, safeAmount, tokenInfo);

    if (result.success) {
      toast({
        title: 'Swap Successful',
        description: `Sold ${formatAmount(sellAmount)} ${sellCoin.toUpperCase()} for ${formatAmount(
          result.buyAmount
        )} ${buyCoin.toUpperCase()}`,
      });

      // Reset input fields
      setSellAmount('');
      setBuyAmount('');
    } else {
      toast({
        title: 'Swap Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  // Format display values (not the actual input values)
  const displaySellAmount = sellAmount ? sellAmount : '';
  const displayBuyAmount = buyAmount ? buyAmount : '';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-8">
        <div className="relative mt-2 flex flex-col gap-1">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border-2 border-background flex items-center justify-center bg-muted/80 rounded-md">
            <Image src="/swap/arrow.svg" alt="arrow" width={20} height={20} />
          </div>

          <div className="flex flex-col gap-3 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Sell</div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <input
                className="text-3xl h-12 border-none w-full focus:outline-none bg-transparent"
                placeholder="0"
                value={displaySellAmount}
                onChange={handleSellAmountChange}
                type="number"
                min="0"
                step="0.000001"
              />
              <Select value={sellCoin} onValueChange={handleSellCoinChange}>
                <SelectTrigger className="h-12 border-none rounded-2xl">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(coinInfoData).map((coin) => (
                    <SelectItem key={coin} value={coin}>
                      {coin.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-right text-muted-foreground">
              Balance: {formatBalance(sellBalance)} {sellCoin.toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Buy</div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <input
                className="text-3xl h-12 border-none w-full focus:outline-none bg-transparent"
                placeholder="0"
                value={displayBuyAmount}
                onChange={handleBuyAmountChange}
                type="number"
                min="0"
                step="0.000001"
              />
              <Select value={buyCoin} onValueChange={handleBuyCoinChange}>
                <SelectTrigger className="h-12 border-none rounded-2xl">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(coinInfoData).map((coin) => (
                    <SelectItem key={coin} value={coin}>
                      {coin.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-right text-muted-foreground">
              Balance: {formatBalance(buyBalance)} {buyCoin.toUpperCase()}
            </div>
          </div>
        </div>

        {tokenInfo.size > 0 && sellCoin !== buyCoin && (
          <div className="mt-3 p-2 bg-muted/40 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Rate</span>
              <span>
                1 {sellCoin.toUpperCase()} ≈{' '}
                {tokenInfo.get(sellCoin) && tokenInfo.get(buyCoin)
                  ? formatAmount(
                      parseFloat(tokenInfo.get(sellCoin)!.priceUSD) /
                        parseFloat(tokenInfo.get(buyCoin)!.priceUSD)
                    )
                  : '0'}{' '}
                {buyCoin.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            className="w-full mt-4 h-12 text-2xl bg-primary rounded-2xl"
            color="primary"
            onClick={handleSwap}
            disabled={
              !sellAmount || parseFloat(sellAmount) <= 0 || sellCoin === buyCoin || isSwapping
            }
          >
            {isSwapping ? <Spin /> : 'Swap'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SwapPage;
