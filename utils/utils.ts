/**
 * Format numbers for friendly display
 * 1. Display up to 6 decimal places for large numbers
 * 2. Trim trailing zeros
 * 3. Handle scientific notation conversion
 */
export function formatAmount(amount: string | number): string {
  if (!amount && amount !== 0) return '0';

  // Convert to number
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // If zero, return directly
  if (num === 0) return '0';

  // For very small numbers, use fixed precision and remove trailing zeros
  if (Math.abs(num) < 0.000001) {
    return num.toFixed(10).replace(/\.?0+$/, '');
  }

  // For regular numbers, format with appropriate precision
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });

  return formatted;
}

/**
 * Format balance display
 * Show balances with appropriate decimal places and thousand separators
 */
export function formatBalance(balance: string | number): string {
  if (!balance && balance !== 0) return '0';

  const num = typeof balance === 'string' ? parseFloat(balance) : balance;

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

/**
 * Ensure the number string has no more than maxDecimals decimal places
 * Prevent errors when using parseUnits or similar functions that require specific precision
 */
export function ensureCorrectDecimals(amount: string | number, maxDecimals: number): string {
  if (!amount && amount !== 0) return '0';

  const amountStr = amount.toString();

  // If there's no decimal point, return as is
  if (!amountStr.includes('.')) return amountStr;

  const parts = amountStr.split('.');

  // Truncate decimals to the specified maximum
  if (parts[1] && parts[1].length > maxDecimals) {
    parts[1] = parts[1].substring(0, maxDecimals);
  }

  // Remove trailing zeros from decimals
  if (parts[1]) {
    parts[1] = parts[1].replace(/0+$/, '');
  }

  // If all decimal digits were zeros, return just the integer part
  if (!parts[1]) {
    return parts[0];
  }

  return parts.join('.');
}
