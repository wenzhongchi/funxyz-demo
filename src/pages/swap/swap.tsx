import React, { useEffect } from 'react';

import { getAssetPriceInfo } from '@funkit/api-base';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const usdcChainId = '1';
const apiKey = 'Z9SZaOwpmE40KX61mUKWm5hrpGh7WHVkaTvQJpQk';

const usdtAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const usdtChainId = '137';

const ethAddress = '0x0000000000000000000000000000000000000000';
const ethChainId = '8453';

const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const wbtcChainId = '1';

const SwapPage: React.FC = () => {
  const fetchPrice = async () => {
    const tokenInfo = await getAssetPriceInfo({
      chainId: '1',
      assetTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // usdc
      apiKey: 'Z9SZaOwpmE40KX61mUKWm5hrpGh7WHVkaTvQJpQk',
    });

    console.log(tokenInfo);
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  return (
    <Layout title="Swap">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button className="bg-muted/80 text-foreground border-none rounded-2xl hover:bg-muted">
              Swap
            </Button>
            <Button className="bg-transparent text-muted-foreground border-none rounded-2xl hover:bg-muted/10">
              Send
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="border-none">
            <img src="/swap/setting.svg" alt="setting" />
          </Button>
        </div>
        <div className="relative mt-2 flex flex-col gap-1">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 border-2 border-background flex items-center justify-center bg-muted/80 rounded-md">
            <img src="/swap/arrow.svg" alt="arrow" />
          </div>

          <div className="flex flex-col gap-3 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Sell</div>
            <div className="flex items-center justify-between gap-2 mb-6">
              <input
                className="text-3xl h-12 border-none w-full focus:outline-none"
                placeholder="0"
              />
              <Select>
                <SelectTrigger className="h-12 border-none rounded-2xl">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-4 bg-muted/80 rounded-2xl">
            <div className="text-sm text-muted-foreground">Buy</div>
            <div className="flex items-center justify-between gap-2 mb-6">
              <input
                className="text-3xl h-12 border-none w-full focus:outline-none"
                placeholder="0"
              />
              <Select>
                <SelectTrigger className="h-12 border-none rounded-2xl">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="w-full mt-4 h-12 text-2xl bg-primary rounded-2xl" color="primary">
            Swap
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SwapPage;
