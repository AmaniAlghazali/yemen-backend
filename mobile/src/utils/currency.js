const currencyData = {
  USD: { symbol: '$', label: 'USD - US Dollar' },
  YER: { symbol: '﷼', label: 'YER - Yemen Riyal' },
  EUR: { symbol: '€', label: 'EUR - Euro' },
  SAR: { symbol: 'SAR', label: 'SAR - Saudi Riyal' },
  AED: { symbol: 'د.إ', label: 'AED - UAE Dirham' },
};

export function formatPrice(price, currencyCode = 'SAR') {
  const code = currencyCode?.toUpperCase() || 'SAR';
  const data = currencyData[code];
  if (!data) return `${parseFloat(price || 0).toFixed(2)} ${code}`;
  return `${parseFloat(price || 0).toFixed(2)} ${data.symbol}`;
}

export function getCurrencySymbol(currencyCode = 'SAR') {
  const code = currencyCode?.toUpperCase() || 'SAR';
  return currencyData[code]?.symbol || code;
}

export function getCurrencyLabel(currencyCode = 'SAR') {
  const code = currencyCode?.toUpperCase() || 'SAR';
  return currencyData[code]?.label || code;
}
