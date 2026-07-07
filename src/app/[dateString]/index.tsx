import { useMonth } from "@/components/date-provider";
import { QueryError } from "@/components/query-error";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultLocaleCode, defaultTimeZone } from "@/i18n";
import { calculateInstallmentCount } from "@/lib/installments";
import { cn } from "@/lib/utils";
import { and, gte, isNull, lt, or } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { ScrollView, Text, View } from "react-native";

export default function ExpenseListScreen() {
  const month = useMonth();
  const rangeStart = month.asMonth
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);
  const rangeEnd = month.asMonth
    .add({ months: 1 })
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);

  const rangeStartDate = new Date(rangeStart.epochMilliseconds);
  const rangeEndDate = new Date(rangeEnd.epochMilliseconds);

  const { data: expensesData, error: expensesError } = useLiveQuery(
    db
      .select()
      .from(expenses)
      .where(
        and(
          gte(expenses.startDate, rangeStartDate),
          or(isNull(expenses.endDate), lt(expenses.endDate, rangeEndDate)),
        ),
      ),
  );
  const { data: paymentsData, error: paymentsError } = useLiveQuery(
    db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.paidAt, rangeStartDate),
          lt(payments.paidAt, rangeEndDate),
        ),
      ),
  );

  if (expensesError) return <QueryError error={expensesError} />;
  if (paymentsError) return <QueryError error={paymentsError} />;

  const expensesList = mergeExpensesAndPayments(expensesData, paymentsData);

  return (
    <ScrollView>
      {expensesList.map((expense) => (
        <View
          key={expense.id}
          className={cn(
            "flex w-full flex-row justify-between border-b border-gray-400 p-4",
            expense.payments.length && "bg-green-200 dark:bg-green-600",
          )}
        >
          <View>
            <Text>{expense.description}</Text>
            <Text>
              {expense.startDate.toLocaleDateString(defaultLocaleCode)} &bull;{" "}
              {expense.endDate != null &&
                expense.endDate !== expense.startDate && (
                  <Installments
                    currentDate={rangeEndDate}
                    startDate={expense.startDate}
                    endDate={expense.endDate}
                  />
                )}
            </Text>
          </View>
          <View></View>
        </View>
      ))}
    </ScrollView>
  );
}

function Installments({
  startDate,
  endDate,
  currentDate,
}: {
  startDate: Date;
  endDate: Date;
  currentDate: Date;
}) {
  const installmentCount = calculateInstallmentCount(startDate, endDate);
  const currentInstallment = calculateInstallmentCount(startDate, currentDate);

  return (
    <>
      {currentInstallment} / {installmentCount}
    </>
  );
}

function mergeExpensesAndPayments(
  expensesData: (typeof expenses.$inferSelect)[],
  paymentsData: (typeof payments.$inferSelect)[],
) {
  return expensesData.map((expense) => ({
    ...expense,
    payments: paymentsData.filter(
      (payment) => payment.expenseId === expense.id,
    ),
  }));
}
