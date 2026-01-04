/**
 * calc.ts
 * All computation logic for cost of living comparisons
 */

export type IndexFactor = 'overall' | 'housing' | 'utilities' | 'groceries' | 'transportation' | 'healthcare' | 'miscellaneous';

export interface Indices {
  overall: number;
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

export interface TaxRates {
  incomeTax: number;      // Top marginal state income tax rate (percentage)
  propertyTax: number;    // Average effective property tax rate (percentage)
  salesTax: number;       // State sales tax rate (percentage)
}

export interface AdditionalData {
  taxes?: TaxRates;      // Only available for states
  medianIncome?: number; // Only available for states
  unemploymentRate?: number; // Only available for states
  purchasingPower?: number; // Available for cities
  costPlusRent?: number; // Available for cities
}

export interface LocationData {
  code?: string;         // State code (for states)
  name: string;          // Full name (State name or City, State)
  state?: string;        // State abbreviation (for cities)
  type: 'state' | 'city'; // Location type
  indices: Indices;
  additionalData: AdditionalData;
}

export interface StateData extends LocationData {
  code: string; // States always have codes
}

export interface DatasetMeta {
  source: string;
  lastUpdated: string;
  note?: string;
}

export interface Dataset {
  meta: DatasetMeta;
  states: LocationData[];  // Changed from StateData[] to LocationData[]
  cities?: LocationData[]; // New optional cities array
}

export interface ComparableByFactor {
  overall: number;
  housing: number;
  utilities: number;
  groceries: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

export interface ComparisonRow {
  code: string;
  name: string;
  indices: Indices;
  additionalData: AdditionalData;
  comparableOverall: number;
  comparableByFactor: ComparableByFactor;
}

/**
 * Compute comparable salary for a target state relative to baseline.
 * Formula: income * (targetIndex / baselineIndex)
 * 
 * @param income - Annual income in baseline state
 * @param baselineIndex - Cost index for baseline state
 * @param targetIndex - Cost index for target state
 * @returns Comparable salary in target state
 */
export function computeComparableSalary(
  income: number,
  baselineIndex: number,
  targetIndex: number
): number {
  if (baselineIndex === 0) return income; // Avoid division by zero
  return (income * targetIndex) / baselineIndex;
}

/**
 * Generate comparison rows for selected states
 * 
 * @param selectedStates - Array of selected state data
 * @param baselineCode - Code of the baseline state
 * @param income - Annual income in baseline state
 * @returns Array of comparison rows with computed comparable salaries
 */
export function generateComparisonData(
  selectedLocations: LocationData[],
  baselineCode: string,
  income: number
): ComparisonRow[] {
  // Find baseline location
  const baselineLocation = selectedLocations.find(l => l.code === baselineCode || l.name === baselineCode);
  if (!baselineLocation) {
    // Fallback to first location if baseline not found
    return [];
  }

  return selectedLocations.map(location => {
    // Compute overall comparable salary
    const comparableOverall = computeComparableSalary(
      income,
      baselineLocation.indices.overall,
      location.indices.overall
    );

    // Compute comparable salary for each factor
    const comparableByFactor: ComparableByFactor = {
      overall: comparableOverall,
      housing: computeComparableSalary(
        income,
        baselineLocation.indices.housing,
        location.indices.housing
      ),
      utilities: computeComparableSalary(
        income,
        baselineLocation.indices.utilities,
        location.indices.utilities
      ),
      groceries: computeComparableSalary(
        income,
        baselineLocation.indices.groceries,
        location.indices.groceries
      ),
      transportation: computeComparableSalary(
        income,
        baselineLocation.indices.transportation,
        location.indices.transportation
      ),
      healthcare: computeComparableSalary(
        income,
        baselineLocation.indices.healthcare,
        location.indices.healthcare
      ),
      miscellaneous: computeComparableSalary(
        income,
        baselineLocation.indices.miscellaneous,
        location.indices.miscellaneous
      ),
    };

    return {
      code: location.code || location.name,
      name: location.name,
      indices: location.indices,
      additionalData: location.additionalData,
      comparableOverall,
      comparableByFactor,
    };
  });
}

/**
 * Format currency for display
 * 
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
