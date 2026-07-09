import { defaultTimeZone } from "@/i18n";

export function calculateInstallmentCount(startDate: Date, endDate: Date) {
  if (!startDate || !endDate) return 1;

  const startMonth = getMonthBoundary(startDate);
  const endMonth = getMonthBoundary(endDate);
  const monthDifference = getMonthDifference(startMonth, endMonth);

  return Math.max(1, monthDifference + 1);
}

export function calculateInstallmentNumber(
  startDate: Date,
  currentDate: Date,
  totalInstallments?: number,
) {
  if (!startDate || !currentDate) return 1;

  const startMonth = getMonthBoundary(startDate);
  const currentMonth = getMonthBoundary(currentDate);
  const currentInstallment = Math.max(
    1,
    getMonthDifference(startMonth, currentMonth) + 1,
  );

  return totalInstallments != null
    ? Math.min(totalInstallments, currentInstallment)
    : currentInstallment;
}

function getMonthDifference(
  startMonth: ReturnType<typeof getMonthBoundary>,
  endMonth: ReturnType<typeof getMonthBoundary>,
) {
  return (
    (endMonth.year - startMonth.year) * 12 + (endMonth.month - startMonth.month)
  );
}

function getMonthBoundary(date: Date) {
  return date
    .toTemporalInstant()
    .toZonedDateTimeISO(defaultTimeZone)
    .toPlainDate()
    .with({ day: 1 });
}
