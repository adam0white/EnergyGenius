/**
 * TypeScript interfaces for Energy Genius mock data structures
 *
 * These types define the structure of supplier plans, usage scenarios,
 * and related data used throughout the recommendation pipeline.
 */

/**
 * Represents a supplier's electricity plan with pricing and features
 */
export interface SupplierPlan {
  /** Unique plan identifier */
  id: string;

  /** Supplier company name */
  supplier: string;

  /** Descriptive plan name */
  planName: string;

  /** Base electricity rate in $/kWh */
  baseRate: number;

  /** Monthly service fee in dollars */
  monthlyFee: number;

  /** Contract term length in months (3, 6, 12, or 24) */
  contractTermMonths: number;

  /** Early termination fee in dollars (0 for no penalty) */
  earlyTerminationFee: number;

  /** Percentage of renewable energy (0-100) */
  renewablePercent: number;

  /** Quality ratings on 1-5 scale */
  ratings: {
    /** Reliability score (1-5) */
    reliabilityScore: number;

    /** Customer service quality score (1-5) */
    customerServiceScore: number;
  };

  /** Array of plan features (e.g., "24/7 Support", "Mobile App") */
  features: string[];

  /** List of state abbreviations where plan is available */
  availableInStates: string[];
}

/**
 * Represents monthly electricity usage data
 */
export interface UsageData {
  /** Month number (1-12) */
  month: number;

  /** Kilowatt-hours consumed */
  kWh: number;

  /** Optional peak usage day of week */
  dayOfWeek?: string;
}

/**
 * Represents a complete usage scenario with 12 months of data
 */
export interface UsageScenario {
  /** Scenario identifier */
  id: string;

  /** Human-readable scenario name */
  name: string;

  /** Description of usage pattern */
  description: string;

  /** Usage type classification */
  type: "residential" | "small-business" | "seasonal-high" | "seasonal-low";

  /** Array of 12 monthly data points */
  monthlyUsage: UsageData[];

  /** Total annual consumption in kWh */
  annualKWh: number;

  /** Calculated average monthly consumption */
  averageMonthlyKWh: number;
}

/**
 * Represents a user's current electricity plan
 */
export interface CurrentPlan {
  /** Current supplier name */
  supplier: string;

  /** Current plan name */
  planName: string;

  /** Current rate in $/kWh */
  currentRate: number;

  /** Monthly service fee in dollars */
  monthlyFee: number;

  /** Contract end date in ISO format (optional) */
  contractEndDate?: string;

  /** Number of months remaining in contract */
  monthsRemaining: number;

  /** Early termination fee if applicable */
  earlyTerminationFee: number;
}

/**
 * Represents user preferences for plan recommendations
 */
export interface UserPreferences {
  /** Prioritize cost savings */
  prioritizeSavings: boolean;

  /** Prioritize renewable energy */
  prioritizeRenewable: boolean;

  /** Prioritize contract flexibility */
  prioritizeFlexibility: boolean;

  /** Maximum acceptable contract length in months */
  maxContractMonths: number;

  /** User's risk tolerance level */
  riskTolerance: "low" | "medium" | "high";
}
