/**
 * Number & Emission formatting helpers
 */

/**
 * Formats carbon values to a standardized string representation.
 * @param kgValue Footprint value in kg CO2
 */
export const formatCarbon = (kgValue: number): string => {
  if (kgValue >= 1000) {
    return `${(kgValue / 1000).toFixed(2)} tons CO₂`;
  }
  return `${kgValue.toFixed(1)} kg CO₂`;
};

/**
 * Formats points balances with proper thousands comma separator.
 */
export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat().format(points) + ' Pts';
};

/**
 * Formats local ISO dates.
 */
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
