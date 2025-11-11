/**
 * Data formatting utilities for currency, numbers, and percentages
 */

/**
 * Format a number as USD currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

/**
 * Format a number with thousands separator
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatNumber(num: number, decimals = 0): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(num);
}

/**
 * Format a number as a percentage
 * @param num - The number to format (0-1 or 0-100 depending on normalize)
 * @param decimals - Number of decimal places (default: 1)
 * @param normalize - If true, treats input as 0-1 and multiplies by 100 (default: false)
 * @returns Formatted percentage string (e.g., "15.5%")
 */
export function formatPercent(num: number, decimals = 1, normalize = false): string {
	const value = normalize ? num * 100 : num;
	return `${value.toFixed(decimals)}%`;
}

/**
 * Format kWh with proper units
 * @param kWh - Energy usage in kilowatt-hours
 * @returns Formatted energy string (e.g., "1,234 kWh")
 */
export function formatEnergy(kWh: number): string {
	return `${formatNumber(kWh, 0)} kWh`;
}

/**
 * Format rate per kWh
 * @param rate - Rate per kilowatt-hour
 * @returns Formatted rate string (e.g., "$0.123/kWh")
 */
export function formatRate(rate: number): string {
	return `${formatCurrency(rate)}/kWh`;
}

/**
 * Abbreviate large numbers
 * @param num - The number to abbreviate
 * @returns Abbreviated number (e.g., "1.2K", "3.4M")
 */
export function abbreviateNumber(num: number): string {
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(1)}M`;
	}
	if (num >= 1_000) {
		return `${(num / 1_000).toFixed(1)}K`;
	}
	return num.toString();
}
