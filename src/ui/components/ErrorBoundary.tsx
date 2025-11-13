import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/card';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<Card className="p-8 m-4 max-w-md mx-auto text-center">
					<div className="text-red-600 text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
					<p className="text-gray-600 mb-6">
						We encountered an error while displaying your recommendations. Your data is safe - please try refreshing the page.
					</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Reload Page
					</button>
					{import.meta.env.DEV && this.state.error && (
						<details className="mt-4 text-left">
							<summary className="cursor-pointer text-sm text-gray-600">Error details</summary>
							<pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{this.state.error.toString()}</pre>
						</details>
					)}
				</Card>
			);
		}

		return this.props.children;
	}
}
