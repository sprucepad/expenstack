export function calculateInstallmentCount(startDate: Date, endDate: Date) {
  const start = startDate.toTemporalInstant();
  const end = endDate.toTemporalInstant();

  return start.until(end).months;
}
