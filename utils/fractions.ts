/**
 * Converts a decimal number to a fraction string where appropriate
 * @param value The decimal number to convert
 * @returns A string representation of the number as a fraction if appropriate
 */
export function decimalToFraction(value: number): string {
  // Common fractions to display nicely
  const fractions: Record<number, string> = {
    0.25: '¼',
    0.5: '½',
    0.75: '¾',
    0.33: '⅓',
    0.67: '⅔',
    0.2: '⅕',
    0.4: '⅖',
    0.6: '⅗',
    0.8: '⅘',
    0.17: '⅙',
    0.83: '⅚',
    0.125: '⅛',
    0.375: '⅜',
    0.625: '⅝',
    0.875: '⅞',
  };

  // Handle whole numbers
  if (Number.isInteger(value)) {
    return value.toString();
  }

  // Split into whole and decimal parts
  const wholePart = Math.floor(value);
  const decimalPart = parseFloat((value - wholePart).toFixed(3));

  // Check if we have a direct match in our fractions object
  for (const [decimal, fraction] of Object.entries(fractions)) {
    if (Math.abs(decimalPart - parseFloat(decimal)) < 0.01) {
      return wholePart > 0 ? `${wholePart} ${fraction}` : fraction;
    }
  }

  // If no match, return the original number with up to 2 decimal places
  return value.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
}
