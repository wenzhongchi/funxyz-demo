import React, { useEffect } from 'react';
import { useDebounce } from 'react-use';
import clsx from 'clsx';
import BigNumber from 'bignumber.js';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/select/Select';
import { TOKEN_DECIMALS, TOKEN_INFO, TokenSymbol } from '@config/token';
import { useTokenPrice } from '@hooks/useTokenPrice';
import { useBalanceStore } from '@store/balanceStore';
import { formatBalance } from '@utils/utils';

interface SwapInputProps {
  label: string;
  baseToken: TokenSymbol;
  quoteToken: TokenSymbol;
  amount: string;
  balance: string;
  onTokenChange: (token: TokenSymbol) => void;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SwapInput: React.FC<SwapInputProps> = ({
  label,
  baseToken,
  quoteToken,
  amount,
  balance,
  onTokenChange,
  onAmountChange,
}) => {
  const { tokenInfo, isLoading, refetch } = useTokenPrice(baseToken);
  const { setTokenInfo } = useBalanceStore();

  // Get the decimal places for the selected token
  const tokenDecimals = TOKEN_DECIMALS[baseToken.toUpperCase()];

  // Debounce the refetch function
  const [, setDebounced] = useDebounce(refetch, 300);

  // Trigger debounced refetch when amount changes
  useEffect(() => {
    if (amount && new BigNumber(amount).isGreaterThan(0)) {
      setDebounced();
    }
  }, [amount, setDebounced]);

  useEffect(() => {
    if (tokenInfo && !isLoading) {
      setTokenInfo(baseToken, tokenInfo);
    }
  }, [setTokenInfo, tokenInfo, baseToken, isLoading]);

  // Custom handler to enforce decimal limits
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === '') {
      onAmountChange(e);
      return;
    }

    // Disallow negative numbers by preventing minus sign
    if (value.includes('-')) {
      return;
    }

    // Check if the input has more decimal places than allowed
    if (value.includes('.')) {
      const decimalPlaces = value.split('.')[1].length;
      if (decimalPlaces > tokenDecimals) {
        // Truncate to the allowed number of decimal places
        const truncatedValue = value.substring(0, value.indexOf('.') + tokenDecimals + 1);
        e.target.value = truncatedValue;
      }
    }

    onAmountChange(e);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-muted/80 rounded-2xl">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <input
          className={clsx(
            'text-3xl h-12 border-none w-full focus:outline-none bg-transparent',
            isLoading && 'text-muted-foreground'
          )}
          placeholder="0"
          value={amount}
          onChange={handleAmountChange}
          type="number"
          min="0"
          onKeyDown={(e) => {
            if (e.key === '-') {
              e.preventDefault();
            }
          }}
        />
        <Select value={baseToken} onValueChange={onTokenChange}>
          <SelectTrigger className="h-12 border-none rounded-2xl">
            <SelectValue placeholder="Select a token" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(TOKEN_INFO)
              .filter((tokenSymbol) => tokenSymbol !== quoteToken)
              .map((tokenSymbol) => (
                <SelectItem key={tokenSymbol} value={tokenSymbol}>
                  {tokenSymbol.toUpperCase()}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-xs text-right text-muted-foreground flex justify-between items-center">
        <span>
          Balance: {formatBalance(balance, TOKEN_DECIMALS[baseToken.toUpperCase()])}{' '}
          {baseToken.toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

export default SwapInput;
