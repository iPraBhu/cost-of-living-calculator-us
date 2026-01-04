/**
 * queryState.ts
 * Utilities for reading/writing URL query parameters and sharing
 */

export interface QueryParams {
  states: string[];
  income: number;
  base: string;
  type?: 'state' | 'city';
}

/**
 * Parse query parameters from URL
 * 
 * @param validCodes - Array of valid location codes/names to validate against
 * @returns Parsed query parameters or null if invalid
 */
export function parseQueryParams(validCodes: string[]): QueryParams | null {
  const params = new URLSearchParams(window.location.search);
  
  const statesParam = params.get('states');
  const incomeParam = params.get('income');
  const baseParam = params.get('base');
  const typeParam = params.get('type') as 'state' | 'city' | null;

  if (!statesParam || !incomeParam || !baseParam) {
    return null;
  }

  // Parse states/locations
  const locationCodes = statesParam.split(',').map(s => s.trim());
  const validLocations = locationCodes.filter(code => validCodes.includes(code));

  if (validLocations.length < 2) {
    return null; // Must have at least 2 valid locations
  }

  // Parse income
  const income = parseFloat(incomeParam);
  if (isNaN(income) || income < 0 || income > 10000000) {
    return null; // Invalid income
  }

  // Parse base
  const base = baseParam;
  if (!validLocations.includes(base)) {
    // If base not in selected locations, use first selected
    return {
      states: validLocations,
      income,
      base: validLocations[0],
      type: typeParam || 'state'
    };
  }

  return {
    states: validLocations,
    income,
    base,
    type: typeParam || 'state'
  };
}

/**
 * Generate shareable URL with current state
 * 
 * @param selectedCodes - Array of selected location codes/names
 * @param income - Annual income
 * @param baselineCode - Baseline location code/name
 * @param locationType - Type of locations (state or city)
 * @returns Complete URL with query parameters
 */
export function generateShareUrl(
  selectedCodes: string[],
  income: number,
  baselineCode: string,
  locationType: 'state' | 'city' = 'state'
): string {
  const params = new URLSearchParams();
  params.set('states', selectedCodes.join(','));
  params.set('income', income.toString());
  params.set('base', baselineCode);
  params.set('type', locationType);

  const url = new URL(window.location.href);
  url.search = params.toString();
  return url.toString();
}

/**
 * Copy text to clipboard
 * 
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
