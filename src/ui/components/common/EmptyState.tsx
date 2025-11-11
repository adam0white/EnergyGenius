/**
 * EmptyState - Display for empty data states
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
	title: string;
	description?: string;
	icon?: React.ReactNode;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

/**
 * Displays a message when no data is available with optional call-to-action
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
	return (
		<div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
			{icon && (
				<div className="text-6xl mb-4" aria-hidden="true">
					{icon}
				</div>
			)}
			<h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
			{description && <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>}
			{action && (
				<Button onClick={action.onClick} variant="default">
					{action.label}
				</Button>
			)}
		</div>
	);
}
