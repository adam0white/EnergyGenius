/**
 * Data Module - Barrel Export
 *
 * Provides single-point imports for all data types, catalogs, and validation functions.
 *
 * Usage:
 *   import { supplierCatalog, usageScenarios, SupplierPlan } from '@/worker/data';
 *   import type { UsageScenario, CurrentPlan } from '@/worker/data';
 */

// Export all types
export type { SupplierPlan, UsageData, UsageScenario, CurrentPlan, UserPreferences } from './types';

// Export data catalogs
export { supplierCatalog } from './supplier-catalog';
export { usageScenarios } from './usage-scenarios';

// Export validation functions
export {
	validateSupplierPlan,
	validateUsageScenario,
	validateCurrentPlan,
	validateSupplierCatalog,
	validateUsageScenarios,
} from './validation';

// Re-export defaults for convenience
export { default as supplierCatalogDefault } from './supplier-catalog';
export { default as usageScenariosDefault } from './usage-scenarios';
