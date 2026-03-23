/**
 * Formats a numeric amount into a currency string.
 * Default is INR (₹) as per the project context.
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'INR',
    locale: string = 'en-IN'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Formats a numeric amount into a simplified currency string (e.g., for badges or small UI elements).
 */
export const formatCurrencyShort = (
    amount: number,
    currency: string = 'INR',
    locale: string = 'en-IN'
): string => {
    if (amount >= 100000) {
        return `${formatCurrency(amount / 100000, currency, locale)}L`;
    }
    if (amount >= 1000) {
        return `${formatCurrency(amount / 1000, currency, locale)}K`;
    }
    return formatCurrency(amount, currency, locale);
};
