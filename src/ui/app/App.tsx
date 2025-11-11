/**
 * App - Root application component
 *
 * Provides top-level layout structure with context providers
 * and routing setup for the React SPA.
 */

import { Layout } from '../components/layout';
import { RecommendationProvider } from '../context';
import { IntakeForm } from '../components/intake/IntakeForm';

export default function App() {
	return (
		<RecommendationProvider>
			<Layout>
				<IntakeForm />
			</Layout>
		</RecommendationProvider>
	);
}
