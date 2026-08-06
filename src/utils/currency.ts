import { SUPPORTED_CURRENCIES, CurrencyConfig } from '../types';

/**
 * Maps currency symbols, ISO codes, and aliases to a valid CurrencyConfig
 */
export function getCurrencyConfig(
  currencyCodeOrSymbol?: string,
  explicitSymbol?: string
): CurrencyConfig {
  if (!currencyCodeOrSymbol && !explicitSymbol) {
    return SUPPORTED_CURRENCIES[0]; // Default to USD ($) as international baseline
  }

  const rawInput = (currencyCodeOrSymbol || '').trim();
  const rawSymbol = (explicitSymbol || '').trim();
  const clean = rawInput.toUpperCase();

  // 1. Direct symbol checks
  if (rawInput === '$' || rawSymbol === '$' || clean === 'USD' || clean === 'DOLLAR' || clean === 'US DOLLAR') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'USD') || SUPPORTED_CURRENCIES[0];
  }
  if (rawInput === '€' || rawSymbol === '€' || clean === 'EUR' || clean === 'EURO') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'EUR') || SUPPORTED_CURRENCIES[1];
  }
  if (rawInput === '£' || rawSymbol === '£' || clean === 'GBP' || clean === 'POUND' || clean === 'STERLING') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'GBP') || SUPPORTED_CURRENCIES[2];
  }
  if (rawInput === '₦' || rawSymbol === '₦' || clean === 'NGN' || clean === 'NAIRA') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'NGN') || { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' };
  }
  if (rawInput === 'C$' || clean === 'CAD' || clean === 'CANADIAN DOLLAR') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'CAD') || { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($ CAD)' };
  }
  if (rawInput === 'A$' || clean === 'AUD' || clean === 'AUSTRALIAN DOLLAR') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'AUD') || { code: 'AUD', symbol: '$', name: 'Australian Dollar ($ AUD)' };
  }
  if (rawInput === '₹' || rawSymbol === '₹' || clean === 'INR' || clean === 'RUPEE') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'INR') || { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' };
  }
  if (rawInput === '¥' || rawSymbol === '¥' || clean === 'JPY' || clean === 'YEN') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'JPY') || { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' };
  }
  if (rawInput === 'R' || rawSymbol === 'R' || clean === 'ZAR' || clean === 'RAND') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'ZAR') || { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' };
  }
  if (rawInput === 'GH₵' || rawSymbol === 'GH₵' || clean === 'GHS' || clean === 'CEDI') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'GHS') || { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)' };
  }
  if (rawInput === 'KSH' || rawSymbol === 'KSH' || clean === 'KES' || clean === 'SHILLING') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'KES') || { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)' };
  }
  if (clean === 'CHF' || rawInput === 'CHF') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'CHF') || { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' };
  }
  if (clean === 'AED' || rawInput === 'AED') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'AED') || { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' };
  }

  // 2. Check in supported list
  const match = SUPPORTED_CURRENCIES.find(c => 
    c.code.toUpperCase() === clean || c.symbol === rawInput || c.symbol === rawSymbol
  );
  if (match) return match;

  // 3. Dynamic Currency Creation if detected from document
  if (rawInput.length > 0 || rawSymbol.length > 0) {
    const symbolToUse = rawSymbol || (rawInput.length <= 4 && !/^[A-Z]{3}$/.test(rawInput) ? rawInput : '$');
    const codeToUse = /^[A-Z]{3}$/.test(clean) ? clean : clean.slice(0, 3) || 'CUR';
    return {
      code: codeToUse,
      symbol: symbolToUse,
      name: `${codeToUse} (${symbolToUse})`
    };
  }

  return SUPPORTED_CURRENCIES[0];
}

export function formatCurrencyAmount(amount: number, symbol = '$', includeSign = false): string {
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (includeSign) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${symbol}${formattedNumber}`;
  }

  return `${symbol}${formattedNumber}`;
}
