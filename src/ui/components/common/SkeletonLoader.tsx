/**
 * SkeletonLoader - Placeholder shimmer effect for progressive loading
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonLoaderProps {
	lines?: number;
	variant?: 'text' | 'card' | 'avatar';
	className?: string;
}

/**
 * Displays animated skeleton placeholders during content loading
 */
export function SkeletonLoader({ lines = 3, variant = 'text', className }: SkeletonLoaderProps) {
	if (variant === 'avatar') {
		return (
			<div className={cn('rounded-full bg-muted animate-pulse', 'w-12 h-12', className)} />
		);
	}

	if (variant === 'card') {
		return (
			<div className={cn('rounded-lg bg-muted animate-pulse space-y-3 p-4', className)}>
				<div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
				<div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
				<div className="h-20 bg-muted-foreground/20 rounded" />
			</div>
		);
	}

	// text variant (default)
	return (
		<div className={cn('space-y-2', className)}>
			{Array.from({ length: lines }).map((_, index) => (
				<div
					key={index}
					className="h-4 bg-muted animate-pulse rounded"
					style={{
						width: index === lines - 1 ? '60%' : '100%',
					}}
				/>
			))}
		</div>
	);
}
