/**
 * LoadingSpinner - Animated loading indicator
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	label?: string;
	className?: string;
}

const sizeClasses = {
	sm: 'w-4 h-4 border-2',
	md: 'w-8 h-8 border-3',
	lg: 'w-12 h-12 border-4',
};

/**
 * Displays a centered spinning animation for loading states
 */
export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status">
			<div
				className={cn(
					'animate-spin rounded-full border-primary border-t-transparent',
					sizeClasses[size]
				)}
				aria-hidden="true"
			/>
			{label && (
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{label}
				</p>
			)}
			<span className="sr-only">{label || 'Loading...'}</span>
		</div>
	);
}
