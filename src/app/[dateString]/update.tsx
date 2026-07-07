import { useMonth } from "@/components/date-provider";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { expenses, payments } from "@/db/schema";
import { defaultTimeZone } from "@/i18n";
import { moneyFormatter } from "@/lib/formatter";
import { calculateInstallmentCount } from "@/lib/installments";
import { and, eq, gte, lt } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Checkbox } from "expo-checkbox";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { RadioGroup } from "react-native-radio-buttons-group";

export default function Update() {
  const month = useMonth();
  const { t } = useTranslation();
  const { expenseId: expenseIdAsString } = useLocalSearchParams<{
    expenseId?: string;
  }>();
  const expenseId = expenseIdAsString
    ? Number.parseInt(expenseIdAsString)
    : undefined;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const descriptionRef = useRef<TextInput>(null);
  const [value, setValue] = useState<number | null>(null);
  const [isRepeated, setIsRepeated] = useState(false);
  const [isInstallments, setIsInInstallments] = useState(false);
  const installmentCountRef = useRef<TextInput>(null);

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

  const rangeStart = month.asMonth
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);
  const rangeEnd = month.asMonth
    .add({ months: 1 })
    .toPlainDate({ day: 1 })
    .toZonedDateTime(defaultTimeZone);

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
              gte(payments.paidAt, new Date(rangeStart.epochMilliseconds)),
              lt(payments.paidAt, new Date(rangeEnd.epochMilliseconds)),
            )
          : undefined,
      )
      .limit(1),
    [expenseId],
  );

  async function create(paid: boolean) {
    let endDate: Date | undefined = new Date();
    if (isInstallments) {
      const nodeValue = installmentCountRef.current?.nodeValue;
      const installmentCount = nodeValue ? Number.parseInt(nodeValue) : 1;

      const nextMonthInstant = month.asMonth
        .add({ months: installmentCount })
        .toPlainDate({ day: 1 })
        .toZonedDateTime(defaultTimeZone);
      endDate = new Date(nextMonthInstant.epochMilliseconds);
    } else if (isRepeated) endDate = undefined;

    const { lastInsertRowId } = await db.insert(expenses).values({
      description: descriptionRef.current?.nodeValue ?? "-",
      value: value ?? 0,
      endDate,
    });

    if (paid) {
      await db.insert(payments).values({
        expenseId: lastInsertRowId,
        paidAt: new Date(rangeStart.epochMilliseconds),
        value: value ?? 0,
      });
    }

    router.back();
  }

  async function update(paid?: boolean) {
    let endDate: Date | null | undefined;
    if (isRepeated) {
      if (isInstallments) {
        const currentInstallmentCount = calculateInstallmentCount(
          expense.startDate,
          expense.endDate ?? expense.startDate,
        );

        const nodeValue = installmentCountRef.current?.nodeValue;
        const installmentCount = nodeValue
          ? Number.parseInt(nodeValue)
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
          value: value ?? undefined,
          description: descriptionRef.current?.nodeValue ?? undefined,
          endDate,
        })
        .where(eq(expenses.id, expense.id));

      if (paid != null) {
        if (paid) {
          await db.insert(payments).values({
            value: value ?? 0,
            expenseId: expense.id,
            paidAt: new Date(rangeStart.epochMilliseconds),
          });
        } else {
          await db.delete(payments).where(eq(payments.id, payment.id));
        }
      }
      router.back();
    }
  }

  async function remove() {
    await db.delete(payments).where(eq(payments.expenseId, expense.id));
    await db.delete(expenses).where(eq(expenses.id, expense.id));
    router.back();
  }

  if (expenseError) return <QueryError error={expenseError} />;
  if (paymentError) return <QueryError error={paymentError} />;

  return (
    <View className="flex h-full justify-between p-8">
      <View className="flex gap-4">
        <View>
          <Text className="text-black dark:text-white">
            {t("update.description")}
          </Text>
          <TextInput
            ref={descriptionRef}
            placeholder={t("update.descriptionPlaceholder")}
            className="border-b border-b-black text-black placeholder:text-gray-400 dark:border-b-white dark:text-white"
          />
        </View>

        <View>
          <Text className="text-black dark:text-white">
            {t("update.value")}
          </Text>
          <CurrencyInput
            value={value}
            onChangeValue={setValue}
            placeholder={moneyFormatter.format(0)}
            prefix={
              moneyFormatter
                .formatToParts(0)
                .find((part) => part.type === "currency")!.value + " "
            }
            className="border-b border-b-black text-black placeholder:text-gray-400 dark:border-b-white dark:text-white"
          />
        </View>

        <View className="flex-row gap-2">
          <Checkbox value={isRepeated} onValueChange={setIsRepeated} />
          <Text className="text-black dark:text-white">
            {t("update.repeated")}
          </Text>
        </View>

        {isRepeated && (
          <RadioGroup
            layout="row"
            radioButtons={[
              {
                id: "fixed",
                value: "fixed",
                containerStyle: { gap: 8 },
                label: (
                  <Text className="text-black dark:text-white">
                    {t("update.fixed")}
                  </Text>
                ),
              },
              {
                id: "installments",
                value: "installments",
                containerStyle: { gap: 8 },
                label: (
                  <Text className="text-black dark:text-white">
                    {t("update.installments")}
                  </Text>
                ),
              },
            ]}
            selectedId={isInstallments ? "installments" : "fixed"}
            onPress={(id) => setIsInInstallments(id === "installments")}
          />
        )}

        {isRepeated && isInstallments && (
          <View>
            <Text className="text-black dark:text-white">
              {t("update.installmentCount")}
            </Text>
            <TextInput
              keyboardType="number-pad"
              ref={installmentCountRef}
              placeholder="1"
              className="border-b border-b-black text-black placeholder:text-gray-400 dark:border-b-white dark:text-white"
            />
          </View>
        )}
      </View>
      <View className="flex gap-4">
        <Button
          onPress={async () => {
            if (expenseId) await update();
            else await create(false);
          }}
        >
          <Text className="text-center text-black uppercase dark:text-white">
            {expenseId ? t("update.update") : t("update.add")}
          </Text>
        </Button>
        <Button
          onPress={async () => {
            if (expenseId) await update(true);
            else await create(true);
          }}
          className="will-change-variable"
          variant={payment ? "warning" : "primary"}
        >
          <Text className="text-center text-black uppercase dark:text-white">
            {payment ? t("update.unpaid") : t("update.paid")}
          </Text>
        </Button>
        <Button
          variant="destructive"
          onPress={async () => {
            if (expenseId) await remove();
            else router.back();
          }}
        >
          <Text className="text-center text-black uppercase dark:text-white">
            {t("update.remove")}
          </Text>
        </Button>
      </View>
    </View>
  );
}
