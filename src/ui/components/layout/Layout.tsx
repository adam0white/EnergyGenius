/**
 * Layout - Main application layout wrapper
 *
 * Provides consistent header, main content, and footer structure
 * for all pages with responsive design.
 */

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export interface LayoutProps {
	children: React.ReactNode;
}

/**
 * Main layout component with header, content area, and footer
 */
export function Layout({ children }: LayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Skip link for keyboard navigation */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
			>
				Skip to main content
			</a>
			<Header />
			<main id="main-content" className="flex-1 w-full" tabIndex={-1}>
				<div className="container mx-auto py-6 px-4 md:px-6">{children}</div>
			</main>
			<Footer />
		</div>
	);
}
