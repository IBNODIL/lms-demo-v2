/**
 * Format date consistently to prevent hydration mismatches
 * Returns date in YYYY-MM-DD format
 */
export function formatDateConsistent(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}
