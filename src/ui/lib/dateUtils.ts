/**
 * Date and time formatting utilities
 */

/**
 * Format a date in user-friendly format
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(d);
}

/**
 * Format a time with hours and minutes
 * @param date - Date object or ISO string
 * @param includeSeconds - Whether to include seconds (default: false)
 * @returns Formatted time string (e.g., "3:45 PM" or "3:45:30 PM")
 */
export function formatTime(date: Date | string, includeSeconds = false): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		...(includeSeconds && { second: '2-digit' }),
		hour12: true,
	}).format(d);
}

/**
 * Format date and time together
 * @param date - Date object or ISO string
 * @returns Formatted datetime string (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
	return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative time from now
 * @param date - Date object or ISO string
 * @returns Relative time string (e.g., "5 minutes ago", "in 2 hours")
 */
export function getRelativeTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	// Future dates
	if (diffMs < 0) {
		const absDiffMins = Math.abs(diffMins);
		const absDiffHours = Math.abs(diffHours);
		const absDiffDays = Math.abs(diffDays);

		if (absDiffMins < 1) return 'in a few seconds';
		if (absDiffMins < 60) return `in ${absDiffMins} minute${absDiffMins === 1 ? '' : 's'}`;
		if (absDiffHours < 24) return `in ${absDiffHours} hour${absDiffHours === 1 ? '' : 's'}`;
		return `in ${absDiffDays} day${absDiffDays === 1 ? '' : 's'}`;
	}

	// Past dates
	if (diffSecs < 10) return 'just now';
	if (diffSecs < 60) return `${diffSecs} seconds ago`;
	if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
	if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

	// For older dates, use absolute format
	return formatDate(d);
}

/**
 * Calculate duration between two dates
 * @param startDate - Start date
 * @param endDate - End date (default: now)
 * @returns Duration string (e.g., "2h 15m 30s")
 */
export function formatDuration(startDate: Date | string, endDate: Date | string = new Date()): string {
	const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
	const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

	const diffMs = end.getTime() - start.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const hours = Math.floor(diffSecs / 3600);
	const minutes = Math.floor((diffSecs % 3600) / 60);
	const seconds = diffSecs % 60;

	const parts: string[] = [];
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

	return parts.join(' ');
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date | string): boolean {
	const d = typeof date === 'string' ? new Date(date) : date;
	const today = new Date();
	return (
		d.getDate() === today.getDate() &&
		d.getMonth() === today.getMonth() &&
		d.getFullYear() === today.getFullYear()
	);
}
