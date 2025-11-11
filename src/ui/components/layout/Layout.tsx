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
			<Header />
			<main className="flex-1 w-full">
				<div className="container mx-auto py-6 px-4 md:px-6">{children}</div>
			</main>
			<Footer />
		</div>
	);
}
