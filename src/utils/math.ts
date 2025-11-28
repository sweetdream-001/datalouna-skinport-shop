// Math utility functions
import { APP_CONFIG } from '../config/constants.js';

/**
 * Rounds a number to the specified number of decimal places
 */
export function roundToDecimalPlaces(value: number, decimals: number = APP_CONFIG.DECIMAL_PLACES): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

