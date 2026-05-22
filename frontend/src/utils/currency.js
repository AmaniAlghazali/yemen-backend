const currencyMap = {
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  YER: { symbol: "YER", code: "YER", name: "Yemeni Rial" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  SAR: { symbol: "SAR", code: "SAR", name: "Saudi Riyal" },
  AED: { symbol: "AED", code: "AED", name: "UAE Dirham" },
};

export const formatPrice = (price, currencyCode = "SAR") => {
  const currency = currencyMap[currencyCode] || currencyMap.SAR;
  return `${Number(price).toFixed(2)} ${currency.symbol}`;
};

export const getCurrencySymbol = (currencyCode = "SAR") => {
  return (currencyMap[currencyCode] || currencyMap.SAR).symbol;
};

export const getCurrencyLabel = (currencyCode = "SAR") => {
  const c = currencyMap[currencyCode] || currencyMap.SAR;
  return `${c.code} (${c.symbol}) - ${c.name}`;
};
