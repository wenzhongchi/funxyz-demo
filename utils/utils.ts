import BigNumber from 'bignumber.js';

import { TOKEN_DECIMALS, TokenSymbol } from '@config/token';

/**
 * Format numbers for friendly display
 * 1. Display up to 6 decimal places for large numbers
 * 2. Trim trailing zeros
 * 3. Handle scientific notation conversion
 */
export const formatAmount = (amount: string | number): string => {
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
};

export const formatBalance = (balance: string | number | undefined, decimals: number): string => {
  if (!balance) return '0';

  try {
    const num = new BigNumber(balance);
    const divisor = new BigNumber(10).pow(decimals);
    const formatted = num.dividedBy(divisor);

    // Convert to string with maximum precision
    const fullPrecision = formatted.toString();

    // If the number is an integer, return it as is
    if (formatted.isInteger()) {
      return fullPrecision;
    }

    // Split into integer and decimal parts
    const parts = fullPrecision.split('.');

    // If there's no decimal part, return the integer
    if (parts.length === 1) {
      return parts[0];
    }

    // Get the decimal part
    let decimalPart = parts[1];

    // If decimal part is all zeros, return just the integer
    if (/^0+$/.test(decimalPart)) {
      return parts[0];
    }

    // Limit to 6 decimal places
    if (decimalPart.length > 6) {
      decimalPart = decimalPart.substring(0, 6);
    }

    // Remove trailing zeros
    decimalPart = decimalPart.replace(/0+$/, '');

    // If all decimal digits were zeros, return just the integer
    if (!decimalPart) {
      return parts[0];
    }

    return `${parts[0]}.${decimalPart}`;
  } catch (e) {
    console.error('Error formatting token balance:', e);
    return '0';
  }
};

/**
 * Ensure the number string has no more than maxDecimals decimal places
 * Prevent errors when using parseUnits or similar functions that require specific precision
 */
export const ensureCorrectDecimals = (amount: string | number, maxDecimals: number): string => {
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
};

// Get decimal places for a token
export const getTokenDecimals = (token: TokenSymbol): number => {
  const tokenUpperCase = token.toUpperCase();
  return TOKEN_DECIMALS[tokenUpperCase] || 18;
};
