import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/select/Select';
import { COIN_INFO, CoinName } from '@config/coin';

interface SwapInputProps {
  value: string;
  baseToken: string;
  quoteToken: string;
  placeholder: string;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTokenChange: (token: CoinName) => void;
}

const SwapInput: React.FC<SwapInputProps> = ({
  value,
  baseToken,
  quoteToken,
  onValueChange,
  onTokenChange,
  placeholder,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <input
        className="text-3xl h-12 border-none w-full focus:outline-none bg-transparent"
        placeholder="0"
        value={value}
        onChange={onValueChange}
        type="number"
        min="0"
        step="0.000001"
      />
      <Select value={quoteToken} onValueChange={onTokenChange}>
        <SelectTrigger className="h-12 border-none rounded-2xl">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(COIN_INFO)
            .filter((coin) => coin !== baseToken)
            .map((coin) => (
              <SelectItem key={coin} value={coin}>
                {coin.toUpperCase()}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SwapInput;
