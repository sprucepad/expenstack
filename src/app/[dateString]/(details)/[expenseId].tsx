import { useMonth } from "@/components/date-provider";
import { Buttons, Form, useScreen } from "@/components/details";
import { QueryError } from "@/components/query-error";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultTimeZone } from "@/i18n";
import { calculateInstallmentCount } from "@/lib/installments";
import { and, eq, gte, lt } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function UpdateScreen() {
  const month = useMonth();
  const rangeStart = month.asMonth
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);
  const rangeStartDate = new Date(rangeStart.epochMilliseconds);
  const rangeEnd = month.asMonth
    .add({ months: 1 })
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);
  const rangeEndDate = new Date(rangeEnd.epochMilliseconds);

  const { expenseId: expenseIdAsString } = useLocalSearchParams<{
    expenseId?: string;
  }>();
  const expenseId = expenseIdAsString
    ? Number.parseInt(expenseIdAsString)
    : undefined;

  const {
    data: [expense],
    error: expenseError,
  } = useLiveQuery(
    db
      .select()
      .from(expenses)
      .where(expenseId ? eq(expenses.id, expenseId) : undefined)
      .limit(1),
    [expenseId],
  );

  const {
    data: [payment],
    error: paymentError,
  } = useLiveQuery(
    db
      .select()
      .from(payments)
      .where(
        expenseId
          ? and(
              eq(payments.expenseId, expenseId),
              gte(payments.paidAt, rangeStartDate),
              lt(payments.paidAt, rangeEndDate),
            )
          : undefined,
      )
      .limit(1),
    [expenseId],
  );

  if (expenseError) return <QueryError error={expenseError} />;
  if (paymentError) return <QueryError error={paymentError} />;
  if (!expense) return <QueryError error={new Error("Expense not found")} />;

  return (
    <UpdateContent
      expense={expense}
      payment={payment}
      rangeStartDate={rangeStartDate}
    />
  );
}

function UpdateContent({
  expense,
  payment,
  rangeStartDate,
}: {
  expense: typeof expenses.$inferSelect;
  payment?: typeof payments.$inferSelect;
  rangeStartDate: Date;
}) {
  const { t } = useTranslation();
  const state = useScreen({
    description: expense.description,
    installmentCount: String(
      calculateInstallmentCount(
        expense.startDate,
        expense.endDate ?? expense.startDate,
      ),
    ),
    isInstallments:
      expense.endDate != null &&
      expense.endDate.getTime() !== expense.startDate.getTime(),
    isRepeated:
      expense.endDate == null ||
      expense.endDate.getTime() !== expense.startDate.getTime(),
    value: expense.value || null,
  });

  async function update(updatePaymentState: boolean) {
    let endDate: Date | null | undefined;
    if (state.isRepeated) {
      if (state.isInstallments) {
        const currentInstallmentCount = calculateInstallmentCount(
          expense.startDate,
          expense.endDate ?? expense.startDate,
        );

        const installmentCount = state.installmentCount
          ? Number.parseInt(state.installmentCount)
          : currentInstallmentCount;

        if (installmentCount !== currentInstallmentCount) {
          const currentEndDate = (
            expense.endDate ?? expense.startDate
          ).toTemporalInstant();
          const newEndDate = currentEndDate.add({
            months: currentInstallmentCount - installmentCount,
          });

          endDate = new Date(newEndDate.epochMilliseconds);
        }
      } else endDate = null;

      await db
        .update(expenses)
        .set({
          value: state.value ?? undefined,
          description: state.description || undefined,
          endDate,
        })
        .where(eq(expenses.id, expense.id));

      if (updatePaymentState) {
        if (!payment) {
          await db.insert(payments).values({
            value: state.value ?? 0,
            expenseId: expense.id,
            paidAt: rangeStartDate,
          });
        } else {
          await db.delete(payments).where(eq(payments.id, payment.id));
        }
      }
    }
  }

  async function remove() {
    await db.delete(payments).where(eq(payments.expenseId, expense.id));
    await db.delete(expenses).where(eq(expenses.id, expense.id));
  }

  return (
    <View className="flex h-full justify-between p-8">
      <Form state={state} />
      <Buttons
        update={{
          fn: () => update(false),
          label: t("update.update"),
        }}

        paid={{
          fn: () => update(true),
          label: payment ? t("update.unpaid") : t("update.paid"),
          variant: payment ? "warning" : "primary",
        }}

        remove={{
          fn: () => remove(),
          label: t("update.remove"),
        }}
      />
    </View>
  );
}
