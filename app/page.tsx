'use client';

import React, { useState } from 'react';
import Image from 'next/image';

import { Button } from '@components/button/Button';
import SwapInput from '@components/input/SwapInput';
import Layout from '@components/layout/layout';
import Loader from '@components/loader/Loader';
import { useToast } from '@components/toast/Toast';
import { CoinName } from '@config/coin';
import { useTokenPrice } from '@hooks/useTokenPrice';
import { useBalanceStore } from '@store/balanceStore';
import { ensureCorrectDecimals, formatAmount, formatBalance } from '@utils/utils';

const SwapPage: React.FC = () => {
  const { tokenInfo } = useTokenPrice();
  const { getBalance, swap, hasHydrated, isSwapping } = useBalanceStore();
  const { toast } = useToast();

  // Set default selected tokens
  const [sellToken, setSellToken] = useState<CoinName>('usdt');
  const [buyToken, setBuyToken] = useState<CoinName>('eth');

  // User input amounts
  const [sellAmount, setSellAmount] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');

  // Balance
  const sellBalance = getBalance(sellToken);
  const buyBalance = getBalance(buyToken);

  // Reset amounts when selecting tokens
  const handleSellTokenChange = (value: CoinName) => {
    setSellToken(value);
    setSellAmount('');
    setBuyAmount('');
  };

  const handleBuyTokenChange = (value: CoinName) => {
    setBuyToken(value);
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
      if (sellToken && buyToken) {
        const sellTokenInfo = tokenInfo.get(sellToken);
        const buyTokenInfo = tokenInfo.get(buyToken);

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
      if (sellToken && buyToken) {
        const sellTokenInfo = tokenInfo.get(sellToken);
        const buyTokenInfo = tokenInfo.get(buyToken);

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

    if (sellToken === buyToken) {
      toast({
        title: 'Cannot swap the same token',
        variant: 'destructive',
      });
      return;
    }

    // Ensure amount has proper decimal places
    const safeAmount = ensureCorrectDecimals(sellAmount, 18); // Use max precision
    const result = await swap(sellToken, buyToken, safeAmount, tokenInfo);

    if (result.success) {
      toast({
        title: 'Swap Successful',
        description: `Sold ${formatAmount(sellAmount)} ${sellToken.toUpperCase()} for ${formatAmount(
          result.buyAmount
        )} ${buyToken.toUpperCase()}`,
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

  const handleSwitchToken = () => {
    const tempSellToken = sellToken;
    const tempBuyAmount = buyAmount;

    setSellToken(buyToken);
    setBuyToken(tempSellToken);

    setSellAmount(tempBuyAmount);
    setBuyAmount(sellAmount);
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
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border-2 border-background flex items-center justify-center bg-muted/80 rounded-md cursor-pointer hover:bg-muted"
            onClick={handleSwitchToken}
          >
            <Image src="/swap/arrow.svg" alt="arrow" width={20} height={20} />
          </div>

          <div className="flex flex-col gap-3 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Sell</div>
            <SwapInput
              value={displaySellAmount}
              baseToken={buyToken}
              quoteToken={sellToken}
              onValueChange={handleSellAmountChange}
              onTokenChange={handleSellTokenChange}
              placeholder="Select a token"
            />
            <div className="text-xs text-right text-muted-foreground">
              Balance: {formatBalance(sellBalance)} {sellToken.toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Buy</div>
            <SwapInput
              value={displayBuyAmount}
              baseToken={sellToken}
              quoteToken={buyToken}
              onValueChange={handleBuyAmountChange}
              onTokenChange={handleBuyTokenChange}
              placeholder="Select a token"
            />
            <div className="text-xs text-right text-muted-foreground">
              Balance: {formatBalance(buyBalance)} {buyToken.toUpperCase()}
            </div>
          </div>
        </div>

        {tokenInfo.size > 0 && sellToken !== buyToken && (
          <div className="mt-3 p-2 bg-muted/40 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Rate</span>
              <span>
                1 {sellToken.toUpperCase()} ≈{' '}
                {tokenInfo.get(sellToken) && tokenInfo.get(buyToken)
                  ? formatAmount(
                      parseFloat(tokenInfo.get(sellToken)!.priceUSD) /
                        parseFloat(tokenInfo.get(buyToken)!.priceUSD)
                    )
                  : '0'}{' '}
                {buyToken.toUpperCase()}
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
              !sellAmount || parseFloat(sellAmount) <= 0 || sellToken === buyToken || isSwapping
            }
          >
            {isSwapping ? <Loader /> : 'Swap'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SwapPage;
