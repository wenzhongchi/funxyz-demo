import { TOKEN_DECIMALS, TOKEN_INFO, TokenSymbol } from '@config/token';
import { useBalanceStore } from '@store/balanceStore';
import { formatBalance } from '@utils/utils';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog/Dialog';

import { Button } from './Button';

const AccountTokenButton = () => {
  const { balances } = useBalanceStore();

  // Construct tokens array from TOKEN_INFO
  const tokens = Object.keys(TOKEN_INFO).map((symbol) => {
    const tokenSymbol = symbol as TokenSymbol;
    return {
      symbol: tokenSymbol.toUpperCase(),
      balance: balances[tokenSymbol]?.balance,
      decimals: TOKEN_DECIMALS[tokenSymbol.toUpperCase()],
    };
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>My Tokens</DialogTitle>
          <DialogDescription>View your current token balances and details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {tokens.map((token) => (
            <div key={token.symbol} className="rounded-lg border p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">{token.symbol}</h2>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Balance</span>
                <span className="text-2xl font-bold">
                  {formatBalance(token.balance, token.decimals)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountTokenButton;
