import { AgeRange } from "@/types/podcast";

// French display labels for AgeRange values
export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  [AgeRange.UNDER_3]: "0/3 ans",
  [AgeRange.BETWEEN_4_AND_6]: "3/6 ans",
  [AgeRange.BETWEEN_7_AND_9]: "6/9 ans",
  [AgeRange.BETWEEN_10_AND_12]: "9/12 ans",
  [AgeRange.BETWEEN_13_AND_15]: "12/15 ans",
  [AgeRange.OVER_15]: "> 15 ans",
};

export function ageRangeToLabel(value: AgeRange): string {
  return AGE_RANGE_LABELS[value] ?? String(value);
}

export function formatAgeRanges(values: AgeRange[] | undefined | null): string {
  if (!values || values.length === 0) return "";
  return values.map(ageRangeToLabel).join(", ");
}
