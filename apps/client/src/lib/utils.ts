import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a duration string and converts it to seconds.
 * Supports formats like "5h", "30m", "45s", "2d", etc.
 * 
 * @param duration - Duration string (e.g., "5h", "30m", "45s", "2d")
 * @returns Total duration in seconds
 * @example
 * parseDurationToSeconds("5h") // returns 18000
 * parseDurationToSeconds("30m") // returns 1800
 * parseDurationToSeconds("45s") // returns 45
 * parseDurationToSeconds("2d") // returns 172800
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration || typeof duration !== 'string') {
    throw new Error('Duration must be a non-empty string');
  }

  // Match number and unit (e.g., "5h", "30m", "45s")
  const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}. Expected format like "5h", "30m", "45s"`);
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] || 's').toLowerCase();

  // Convert to seconds based on unit
  const multipliers: Record<string, number> = {
    // Seconds
    's': 1,
    'sec': 1,
    'secs': 1,
    'second': 1,
    'seconds': 1,
    // Minutes
    'm': 60,
    'min': 60,
    'mins': 60,
    'minute': 60,
    'minutes': 60,
    // Hours
    'h': 3600,
    'hr': 3600,
    'hrs': 3600,
    'hour': 3600,
    'hours': 3600,
    // Days
    'd': 86400,
    'day': 86400,
    'days': 86400,
  };

  const multiplier = multipliers[unit];

  if (multiplier === undefined) {
    throw new Error(`Unknown time unit: ${unit}. Supported units: s, m, h, d`);
  }

  return Math.floor(value * multiplier);
}

