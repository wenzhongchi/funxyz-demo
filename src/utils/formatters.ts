/**
 * Format price, automatically adjust decimal places based on value
 */
export const formatPrice = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) return '$0';
  if (price === 0) return '$0.00';

  if (price < 0.000001 && price > 0) return '$0.000001';
  if (price < 0.01) return '$' + price.toFixed(6);
  if (price < 1) return '$' + price.toFixed(4);
  if (price < 1000) return '$' + price.toFixed(2);
  if (price < 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });

  return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

/**
 * Format market cap, e.g.: $144.3B
 */
export const formatMarketCap = (marketCap: number): string => {
  if (!marketCap) return '$0';

  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(1)}K`;

  return `$${marketCap.toLocaleString()}`;
};

/**
 * Format percentage change, including + or - sign
 */
export const formatPercentChange = (percent: number): string => {
  if (!percent) return '0%';

  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

/**
 * Format trading volume, simplify large numbers
 */
export const formatVolume = (volume: number): string => {
  if (!volume) return '0';

  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;

  return `${volume.toLocaleString()}`;
};

/**
 * Format date, display as "Jan 01, 2023"
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format time, display as "12:34 PM"
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date +  time, display as "Jan 01, 2023, 12:34 PM"
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
