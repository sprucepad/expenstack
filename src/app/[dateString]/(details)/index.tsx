import { useMonth } from "@/components/date-provider";
import { Buttons, Form, useScreen } from "@/components/details";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultTimeZone } from "@/i18n";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function AddScreen() {
  const { t } = useTranslation();
  const state = useScreen();
  const month = useMonth();
  const rangeStart = month.asMonth
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);
  const rangeEnd = month.asMonth
    .add({ months: 1 })
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);

  async function create(isPaid: boolean) {
    let endDate: Date | undefined = new Date();
    if (state.isInstallments) {
      const installmentCount = state.installmentCount
        ? Number.parseInt(state.installmentCount)
        : 1;

      const nextMonthsInstant = month.asMonth
        .add({ months: installmentCount })
        .toPlainDate({ day: 1 })
        .toZonedDateTime(defaultTimeZone);
      endDate = new Date(nextMonthsInstant.epochMilliseconds);
    } else if (state.isRepeated) endDate = undefined;

    const { lastInsertRowId } = await db.insert(expenses).values({
      description: state.description || "-",
      value: state.value ?? 0,
      endDate,
    });

    if (isPaid) {
      await db.insert(payments).values({
        expenseId: lastInsertRowId,
        paidAt: new Date(rangeStart.epochMilliseconds),
        value: state.value ?? 0,
      });
    }
  }

  return (
    <View className="flex h-full justify-between p-8">
      <Form state={state} />
      <Buttons
        update={{
          fn: () => create(false),
          label: t("update.add"),
        }}

        paid={{
          fn: () => create(true),
          label: t("update.paid"),
          variant: "primary",
        }}

        remove={{
          fn: async () => {},
          label: t("update.remove"),
        }}
      />
    </View>
  );
}
