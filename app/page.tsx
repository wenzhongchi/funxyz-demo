'use client';

import React, { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';

import { Button } from '@components/button/Button';
import SwapInput from '@components/input/SwapInput';
import Layout from '@components/layout/layout';
import Loader from '@components/loader/Loader';
import { useToast } from '@components/toast/Toast';
import { TokenSymbol } from '@config/token';
import { useBalanceStore } from '@store/balanceStore';
import { ensureCorrectDecimals, formatAmount } from '@utils/utils';

const SwapPage: React.FC = () => {
  const { toast } = useToast();

  // Set default selected tokens
  const [sellToken, setSellToken] = useState<TokenSymbol>('usdt');
  const [receiveToken, setReceiveToken] = useState<TokenSymbol>('eth');
  // User input amounts
  const [sellAmount, setSellAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');

  // Balance store
  const { getBalance, swap, hasHydrated, isSwapping, tokenInfo } = useBalanceStore();
  const sellBalance = getBalance(sellToken);
  const receiveBalance = getBalance(receiveToken);
  const receiveTokenInfo = tokenInfo[receiveToken];
  const sellTokenInfo = tokenInfo[sellToken];

  // Reset amounts when selecting tokens
  const handleSellTokenChange = (symbol: TokenSymbol) => {
    setSellToken(symbol);
  };

  const handleReceiveTokenChange = (symbol: TokenSymbol) => {
    setReceiveToken(symbol);
  };

  const calculateReceiveAmount = useCallback(
    (sellAmount: string) => {
      if (!sellAmount || !sellTokenInfo) {
        return '';
      }

      try {
        // Use BigNumber for precise calculations
        const sellAmountBN = new BigNumber(sellAmount);
        const sellPriceBN = new BigNumber(sellTokenInfo.priceUSD);
        const receivePriceBN = new BigNumber(receiveTokenInfo.priceUSD);

        // Calculate with BigNumber
        const sellValueBN = sellAmountBN.times(sellPriceBN);
        const receiveAmountBN = sellValueBN.dividedBy(receivePriceBN);

        // Format the result with appropriate precision
        const calculatedReceiveAmount = receiveAmountBN.toFixed(6, BigNumber.ROUND_DOWN);
        setReceiveAmount(calculatedReceiveAmount);
      } catch (e) {
        console.error('Error calculating receive amount', e);
        setReceiveAmount('');
      }
    },
    [receiveTokenInfo, sellTokenInfo]
  );

  const calculateSellAmount = useCallback(
    (receiveAmount: string) => {
      if (!receiveAmount || !receiveTokenInfo) {
        return '';
      }

      try {
        // Use BigNumber for precise calculations
        const receiveAmountBN = new BigNumber(receiveAmount);
        const receivePriceBN = new BigNumber(receiveTokenInfo.priceUSD);
        const sellPriceBN = new BigNumber(sellTokenInfo.priceUSD);

        // Calculate with BigNumber
        const receiveValueBN = receiveAmountBN.times(receivePriceBN);
        const sellAmountBN = receiveValueBN.dividedBy(sellPriceBN);

        // Format the result with appropriate precision
        const calculatedSellAmount = sellAmountBN.toFixed(6, BigNumber.ROUND_DOWN);
        setSellAmount(calculatedSellAmount);
      } catch (e) {
        console.error('Error calculating sell amount', e);
        setSellAmount('');
      }
    },
    [receiveTokenInfo, sellTokenInfo]
  );

  useEffect(() => {
    calculateReceiveAmount(sellAmount);
  }, [calculateReceiveAmount, sellAmount]);

  // Handle sell amount change, automatically calculate buy amount
  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellAmount(value);

    // If input is empty or no price info, set buy amount to empty
    if (!value || !sellTokenInfo) {
      setReceiveAmount('');
      return;
    }

    try {
      calculateReceiveAmount(value);
    } catch (e) {
      console.error('Error calculating receive amount', e);
    }
  };

  // Handle buy amount change, automatically calculate sell amount
  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReceiveAmount(value);

    // If input is empty or no price info, set sell amount to empty
    if (!value || !receiveTokenInfo) {
      setSellAmount('');
      return;
    }

    try {
      calculateSellAmount(value);
    } catch (e) {
      console.error('Error calculating sell amount', e);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!sellAmount || new BigNumber(sellAmount).isLessThanOrEqualTo(0)) {
      toast({
        title: 'Please enter a valid sell amount',
        variant: 'destructive',
      });
      return;
    }

    if (sellToken === receiveToken) {
      toast({
        title: 'Cannot swap the same token',
        variant: 'destructive',
      });
      return;
    }

    // Ensure amount has proper decimal places
    const safeAmount = ensureCorrectDecimals(sellAmount, 18); // Use max precision
    const result = await swap(sellToken, receiveToken, safeAmount, tokenInfo);

    if (result.success) {
      toast({
        title: 'Swap Successful',
        description: `Sold ${formatAmount(sellAmount)} ${sellToken.toUpperCase()} for ${formatAmount(
          result.receiveAmount
        )} ${receiveToken.toUpperCase()}`,
      });

      // Reset input fields
      setSellAmount('');
      setReceiveAmount('');
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
    const tempReceiveAmount = receiveAmount;

    setSellToken(receiveToken);
    setReceiveToken(tempSellToken);

    setSellAmount(tempReceiveAmount);
    setReceiveAmount(sellAmount);
  };

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Token Swap</h1>

            <div className="space-y-4">
              <SwapInput
                label="You Pay"
                baseToken={sellToken}
                quoteToken={receiveToken}
                amount={sellAmount}
                balance={sellBalance}
                onTokenChange={handleSellTokenChange}
                onAmountChange={handleSellAmountChange}
              />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSwitchToken}
                  disabled={isSwapping}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 rotate-90"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </div>
              <SwapInput
                label="You Receive"
                baseToken={receiveToken}
                quoteToken={sellToken}
                amount={receiveAmount}
                balance={receiveBalance}
                onTokenChange={handleReceiveTokenChange}
                onAmountChange={handleBuyAmountChange}
              />
            </div>

            {sellTokenInfo && receiveTokenInfo && sellToken !== receiveToken && (
              <div className="mt-3 p-2 bg-muted/40 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Rate</span>
                  <span>
                    1 {sellToken.toUpperCase()} ≈{' '}
                    {sellTokenInfo && receiveTokenInfo
                      ? formatAmount(
                          new BigNumber(sellTokenInfo.priceUSD)
                            .dividedBy(new BigNumber(receiveTokenInfo.priceUSD))
                            .toString()
                        )
                      : '0'}{' '}
                    {receiveToken.toUpperCase()}
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
                  !sellAmount ||
                  new BigNumber(sellAmount).isLessThanOrEqualTo(0) ||
                  sellToken === receiveToken ||
                  isSwapping
                }
              >
                {isSwapping ? <Loader /> : 'Swap'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SwapPage;
