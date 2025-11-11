/**
 * Header - Application header with title and navigation
 */

import React from 'react';

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center px-4 md:px-6">
				<div className="flex items-center gap-2">
					<span className="text-2xl" aria-hidden="true">
						⚡
					</span>
					<h1 className="text-xl font-bold md:text-2xl">EnergyGenius</h1>
				</div>

				{/* Navigation placeholder for future enhancement */}
				<nav className="ml-auto flex items-center gap-4" aria-label="Main navigation">
					<span className="text-sm text-muted-foreground hidden md:inline">
						AI-Powered Energy Plan Recommendations
					</span>
				</nav>
			</div>
		</header>
	);
}
