/**
 * Utility functions for handling search filter parameters
 */

/**
 * Extracts filter parameters from URL search params
 * Handles both array filters (f[key][]=value) and range filters (f[key][subKey]=value)
 *
 * @param searchParams Raw search parameters from URL
 * @returns Structured filter object
 */
export function extractFiltersFromSearchParams(searchParams: Record<string, string | string[]>): Record<string, any> {
  const filters: Record<string, any> = {};

  Object.keys(searchParams).forEach((param) => {
    // Only process filter parameters (starting with f[)
    if (!param.startsWith('f[') || !param.includes(']')) {
      return;
    }

    // Handle nested filters like f[prices.effectiveAmount][from]=105
    const nestedMatch = param.match(/f\[(.*?)\]\[(.*?)\]/);
    if (nestedMatch && nestedMatch[1] && nestedMatch[2]) {
      const mainKey = nestedMatch[1];
      const subKey = nestedMatch[2];
      const filterValue = searchParams[param];

      // Initialize the nested structure if it doesn't exist
      if (!filters[mainKey]) {
        filters[mainKey] = {};
      }

      // Add the nested value
      filters[mainKey][subKey] = filterValue;
      return;
    }

    // Handle regular filters like f[categoryAssignments.name][]
    const keyMatch = param.match(/f\[(.*?)\](?:\[\])?/);
    if (!keyMatch || !keyMatch[1]) {
      return;
    }

    const filterKey = keyMatch[1];
    const filterValue = searchParams[param];

    if (param.endsWith('[]')) {
      if (!filters[filterKey]) {
        filters[filterKey] = [];
      }

      if (!Array.isArray(filters[filterKey])) {
        filters[filterKey] = [];
      }

      if (Array.isArray(filterValue)) {
        (filters[filterKey] as string[]).push(...filterValue);
      } else {
        (filters[filterKey] as string[]).push(filterValue);
      }
    } else {
      // Single value
      filters[filterKey] = filterValue;
    }
  });

  return filters;
}
