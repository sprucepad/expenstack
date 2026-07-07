import { useMonth } from "@/components/date-provider";
import { QueryError } from "@/components/query-error";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultLocaleCode, defaultTimeZone } from "@/i18n";
import { moneyFormatter } from "@/lib/formatter";
import {
  calculateInstallmentCount,
  calculateInstallmentNumber,
} from "@/lib/installments";
import { cn } from "@/lib/utils";
import { and, gt, gte, isNull, lt, or } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Link } from "expo-router";
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
          lt(expenses.startDate, rangeEndDate),
          or(isNull(expenses.endDate), gt(expenses.endDate, rangeStartDate)),
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
    <View className="flex h-full justify-between">
      <ScrollView>
        {expensesList.map((expense) => (
          <Link
            href={{
              pathname: "/[dateString]/[expenseId]",
              params: { dateString: month.asString, expenseId: expense.id },
            }}
            key={expense.id}
          >
            <View
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
                    expense.endDate.getTime() !==
                      expense.startDate.getTime() && (
                      <>
                        &bull;{" "}
                        <Installments
                          currentDate={rangeStartDate}
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
          </Link>
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
  const currentInstallment = calculateInstallmentNumber(
    startDate,
    currentDate,
    installmentCount,
  );

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
    <View className="bg-gray-200 p-4 dark:bg-gray-700">
      <Text className="text-black dark:text-white">
        {t("main.total")}: {moneyFormatter.format(total)}
      </Text>
      <Text className="text-black dark:text-white">
        {t("main.unpaid")}: {moneyFormatter.format(unpaid)}
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
