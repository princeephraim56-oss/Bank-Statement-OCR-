import { SUPPORTED_CURRENCIES, CurrencyConfig } from '../types';

export function getCurrencyConfig(currencyCodeOrSymbol?: string): CurrencyConfig {
  if (!currencyCodeOrSymbol) {
    return SUPPORTED_CURRENCIES[0]; // Default NGN
  }

  const clean = currencyCodeOrSymbol.trim().toUpperCase();
  
  if (clean === 'NGN' || clean === '₦' || clean === 'NAIRA') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'NGN') || SUPPORTED_CURRENCIES[0];
  }
  if (clean === 'USD' || clean === '$' || clean === 'DOLLAR') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'USD') || SUPPORTED_CURRENCIES[1];
  }
  if (clean === 'GBP' || clean === '£' || clean === 'POUND') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'GBP') || SUPPORTED_CURRENCIES[2];
  }
  if (clean === 'EUR' || clean === '€' || clean === 'EURO') {
    return SUPPORTED_CURRENCIES.find(c => c.code === 'EUR') || SUPPORTED_CURRENCIES[3];
  }

  const match = SUPPORTED_CURRENCIES.find(c => 
    c.code.toUpperCase() === clean || c.symbol === currencyCodeOrSymbol
  );

  return match || SUPPORTED_CURRENCIES[0];
}

export function formatCurrencyAmount(amount: number, symbol = '₦', includeSign = false): string {
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
