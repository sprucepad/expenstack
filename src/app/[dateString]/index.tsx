import { useMonth } from "@/components/date-provider";
import { QueryError } from "@/components/query-error";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultLocaleCode, defaultTimeZone } from "@/i18n";
import { moneyFormatter } from "@/lib/formatter";
import { calculateInstallmentCount } from "@/lib/installments";
import { cn } from "@/lib/utils";
import { and, gte, isNull, lt, or } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useTranslation } from "react-i18next";
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
    <View>
      <ScrollView>
        {expensesList.map((expense) => (
          <View
            key={expense.id}
            className={cn(
              "will-change-variable flex w-full flex-row justify-between border-b border-gray-400 p-4",
              expense.payments.length && "bg-green-200 dark:bg-green-600",
            )}
          >
            <View>
              <Text className="text-xl font-black text-black dark:text-white">
                {expense.description}
              </Text>
              <Text className="text-black dark:text-white">
                {expense.startDate.toLocaleDateString(defaultLocaleCode)}{" "}
                {expense.endDate != null &&
                  expense.endDate !== expense.startDate && (
                    <>
                      &bull;{" "}
                      <Installments
                        currentDate={rangeEndDate}
                        startDate={expense.startDate}
                        endDate={expense.endDate}
                      />
                    </>
                  )}
              </Text>
            </View>
            <View>
              <Text className="text-xl font-black text-black dark:text-white">
                {moneyFormatter.format(expense.value)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <Total expensesData={expensesData} paymentsData={paymentsData} />
    </View>
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

function Total({
  expensesData,
  paymentsData,
}: {
  expensesData: (typeof expenses.$inferSelect)[];
  paymentsData: (typeof payments.$inferSelect)[];
}) {
  const { t } = useTranslation();
  const total = expensesData.reduce(
    (acc, expense) => (acc += expense.value),
    0,
  );
  const totalPaid = paymentsData.reduce(
    (acc, payment) => (acc += payment.value),
    0,
  );
  const unpaid = total - totalPaid;

  return (
    <View>
      <Text>
        {t("main.total")}: {total}
      </Text>
      <Text>
        {t("main.unpaid")}: {unpaid}
      </Text>
    </View>
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
