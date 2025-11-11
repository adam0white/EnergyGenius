/**
 * ErrorAlert - Error message display component
 */

import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getErrorIcon } from '@/lib/errorFormatter';
import { cn } from '@/lib/utils';

export interface ErrorAlertProps {
	message: string;
	code?: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	className?: string;
}

/**
 * Displays error messages with optional retry button
 */
export function ErrorAlert({ message, code, onRetry, onDismiss, className }: ErrorAlertProps) {
	const icon = getErrorIcon(code);

	return (
		<Alert role="alert" className={cn('border-destructive bg-destructive/10', className)}>
			<div className="flex items-start gap-3">
				<span className="text-xl" aria-hidden="true">
					{icon}
				</span>
				<div className="flex-1 space-y-2">
					<p className="text-sm font-medium text-destructive">{message}</p>
					{code && <p className="text-xs text-muted-foreground">Error code: {code}</p>}
					{(onRetry || onDismiss) && (
						<div className="flex gap-2 mt-2">
							{onRetry && (
								<Button size="sm" variant="outline" onClick={onRetry}>
									Retry
								</Button>
							)}
							{onDismiss && (
								<Button size="sm" variant="ghost" onClick={onDismiss}>
									Dismiss
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		</Alert>
	);
}
