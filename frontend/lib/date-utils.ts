export function todayDateString(): string {
  return toDateInputValue(new Date());
}

export function yesterdayDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toDateInputValue(date);
}

export function getRecentDateRange(days: number): { startDate: string; endDate: string } {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 90;
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (safeDays - 1));

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end)
  };
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateString(value: Date | string | null | undefined): string {
  if (!value) return "";

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : toDateInputValue(value);
  }

  const stringValue = value.trim();
  if (!stringValue) return "";
  if (isDateInputValue(stringValue)) return stringValue;

  const datePrefix = stringValue.slice(0, 10);
  if (isDateInputValue(datePrefix)) return datePrefix;

  const parsedDate = new Date(stringValue);
  return Number.isNaN(parsedDate.getTime()) ? "" : toDateInputValue(parsedDate);
}

export function isDateInputValue(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
