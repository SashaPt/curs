export function formatPrice(amount, currency) {
  if (amount == null || amount === '') return '';
  const num = Number(amount);
  if (Number.isNaN(num)) return '';

  const symbol = currency?.symbol || 'Rp';
  const locale = currency?.locale || 'id-ID';
  const decimals = currency?.decimals ?? 0;

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${symbol} ${formatted}`;
}
