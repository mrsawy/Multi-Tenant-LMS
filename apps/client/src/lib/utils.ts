import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a duration string (e.g., "3d", "1h", "30m") to seconds for Redis TTL
 * @param durationString - Duration string in format: number + unit (d=days, h=hours, m=minutes, s=seconds)
 * @returns Number of seconds
 * @example
 * parseDurationToSeconds("3d") // returns 259200 (3 days in seconds)
 * parseDurationToSeconds("1h") // returns 3600 (1 hour in seconds)
 * parseDurationToSeconds("30m") // returns 1800 (30 minutes in seconds)
 */
export function parseDurationToSeconds(durationString: string): number {
  const match = durationString.match(/^(\d+)([dhms])$/i);
  
  if (!match) {
    throw new Error(`Invalid duration format: ${durationString}. Expected format: number + unit (d/h/m/s)`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    d: 60 * 60 * 24,      // days to seconds
    h: 60 * 60,           // hours to seconds
    m: 60,                // minutes to seconds
    s: 1,                 // seconds
  };

  return value * multipliers[unit];
}
