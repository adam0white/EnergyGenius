/**
 * Footer - Application footer with copyright and links
 */

import React, { useState } from 'react';
import { DebugPlans } from '../debug/DebugPlans';
import { Button } from '../ui/button';

export function Footer() {
	const currentYear = new Date().getFullYear();
	const [debugOpen, setDebugOpen] = useState(false);

	return (
		<>
			<footer className="mt-auto w-full border-t bg-background">
				<div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4 md:px-6">
					<div className="text-sm text-muted-foreground">© {currentYear} EnergyGenius. AI-powered energy plan recommendations.</div>

					<div className="flex items-center gap-4 text-sm">
						<span className="text-muted-foreground">Powered by Cloudflare Workers + AI</span>
						<Button variant="ghost" size="sm" onClick={() => setDebugOpen(true)} className="text-xs text-muted-foreground">
							Debug Plans
						</Button>
					</div>
				</div>
			</footer>

			<DebugPlans open={debugOpen} onOpenChange={setDebugOpen} />
		</>
	);
}
