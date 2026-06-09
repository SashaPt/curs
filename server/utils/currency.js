export const CURRENCIES = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', label: 'Индонезийская рупия (Rp)', decimals: 0 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'Доллар США ($)', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Евро (€)', decimals: 2 },
  RUB: { code: 'RUB', symbol: '₽', locale: 'ru-RU', label: 'Российский рубль (₽)', decimals: 0 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'Фунт стерлингов (£)', decimals: 2 }
};

export function getCurrencyFromSettings(settings = {}) {
  const code = settings.currency_code || 'IDR';
  const preset = CURRENCIES[code] || CURRENCIES.IDR;
  return {
    code,
    symbol: settings.currency_symbol || preset.symbol,
    locale: settings.currency_locale || preset.locale,
    decimals: preset.decimals
  };
}

export function formatPrice(amount, currency) {
  if (amount == null || amount === '') return '—';
  const num = Number(amount);
  if (Number.isNaN(num)) return '—';
  const c = currency || CURRENCIES.IDR;
  const formatted = num.toLocaleString(c.locale, {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals
  });
  return `${c.symbol} ${formatted}`;
}
