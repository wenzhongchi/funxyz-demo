import { useTokenBalanceStore } from '@/store/tokenBalanceStore';
import { formatBalance } from '@/lib/utils';
import { COIN_DECIMALS } from '@/lib/constants';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

const AccountTokenButton = () => {
  const { balances } = useTokenBalanceStore();

  const tokens = [
    { symbol: 'USDT', balance: balances.usdt?.balance, decimals: COIN_DECIMALS.USDT },
    { symbol: 'ETH', balance: balances.eth?.balance, decimals: COIN_DECIMALS.ETH },
    { symbol: 'USDC', balance: balances.usdc?.balance, decimals: COIN_DECIMALS.USDC },
    { symbol: 'WBTC', balance: balances.wbtc?.balance, decimals: COIN_DECIMALS.WBTC },
  ];

  const formatTokenBalance = (balance: string | number | undefined, decimals: number): string => {
    if (!balance) return '0';
    
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    
    const formatted = num / Math.pow(10, decimals);
    
    return formatBalance(formatted);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Tokens</Button>
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
                <span className="text-2xl font-bold">{formatTokenBalance(token.balance, token.decimals)}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountTokenButton;
