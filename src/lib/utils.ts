import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIndianDateFromDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function daysBetweenDates(startDate: Date, endDate: Date) {
  const timeDifference = endDate.getTime() - startDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  return Math.floor(daysDifference) + 1;
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

type DateRange = { from: Date, to: Date };
export function optimizeDateRanges(dateRanges: DateRange[]) {
  if (dateRanges.length === 0) return [];

  dateRanges.sort((a, b) => a.from.getTime() - b.from.getTime());

  const mergedRanges: DateRange[] = [];
  let currentRange = dateRanges[0]!;

  for (let i = 1; i < dateRanges.length; i++) {
    const nextRange = dateRanges[i]!;

    if (currentRange.to >= nextRange.from) {
      currentRange.to = new Date(Math.max(currentRange.to.getTime(), nextRange.to.getTime()));
    } else {
      mergedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }

  mergedRanges.push(currentRange);
  return mergedRanges;
}