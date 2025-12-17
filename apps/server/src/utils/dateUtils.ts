interface AddToDateOptions {
  months?: number;
  years?: number;
}

function addToDate(
  isoString: string,
  { months = 0, years = 0 }: AddToDateOptions,
): string {
  const date = new Date(isoString);

  // Add years
  if (years !== 0) {
    date.setFullYear(date.getFullYear() + years);
  }

  // Add months
  if (months !== 0) {
    const day = date.getDate(); // Keep original day
    date.setMonth(date.getMonth() + months);

    // Handle month-end overflow (e.g., Jan 31 → Mar 3)
    if (date.getDate() < day) {
      date.setDate(0); // Moves to last day of the previous month
    }
  }

  return date.toISOString();
}

export function subtractDays(isoString: string, days: number) {
  const date = new Date(isoString);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// Example:
console.log(subtractDays('2025-08-22T03:06:02.518Z', 5));
// → "2025-08-17T03:06:02.518Z"
