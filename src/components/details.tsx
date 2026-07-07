import { Button } from "@/components/ui/button";
import { moneyFormatter } from "@/lib/formatter";
import { Checkbox } from "expo-checkbox";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GestureResponderEvent, Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { RadioGroup } from "react-native-radio-buttons-group";

export function Buttons({
  update,
  paid,
  remove,
}: {
  update: { label: string; fn: (e: GestureResponderEvent) => Promise<void> };
  paid: {
    label: string;
    fn: (e: GestureResponderEvent) => Promise<void>;
    variant: React.ComponentProps<typeof Button>["variant"];
  };
  remove: { label: string; fn: (e: GestureResponderEvent) => Promise<void> };
}) {
  return (
    <View className="flex gap-4">
      <Button
        onPress={async (e) => {
          await update.fn(e);
          router.back();
        }}
      >
        <Text className="text-center text-black uppercase dark:text-white">
          {update.label}
        </Text>
      </Button>
      <Button
        onPress={async (e) => {
          await paid.fn(e);
          router.back();
        }}
        className="will-change-variable"
        variant={paid.variant}
      >
        <Text className="text-center text-black uppercase dark:text-white">
          {paid.label}
        </Text>
      </Button>
      <Button
        variant="destructive"
        onPress={async (e) => {
          await remove.fn(e);
          router.back();
        }}
      >
        <Text className="text-center text-black uppercase dark:text-white">
          {remove.label}
        </Text>
      </Button>
    </View>
  );
}

export function Form({ state }: { state: ReturnType<typeof useScreen> }) {
  const { t } = useTranslation();
  return (
    <View className="flex gap-4">
      <View>
        <Text className="text-black dark:text-white">
          {t("update.description")}
        </Text>
        <TextInput
          placeholder={t("update.descriptionPlaceholder")}
          className="border-b border-b-black text-black placeholder:text-gray-400 dark:border-b-white dark:text-white"
          value={state.description}
          onChangeText={state.setDescription}
        />
      </View>

      <View>
        <Text className="text-black dark:text-white">{t("update.value")}</Text>
        <CurrencyInput
          value={state.value}
          onChangeValue={state.setValue}
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
        <Checkbox
          value={state.isRepeated}
          onValueChange={state.setIsRepeated}
        />
        <Text className="text-black dark:text-white">
          {t("update.repeated")}
        </Text>
      </View>

      {state.isRepeated && (
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
          selectedId={state.isInstallments ? "installments" : "fixed"}
          onPress={(id) => state.setIsInInstallments(id === "installments")}
        />
      )}

      {state.isRepeated && state.isInstallments && (
        <View>
          <Text className="text-black dark:text-white">
            {t("update.installmentCount")}
          </Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="1"
            className="border-b border-b-black text-black placeholder:text-gray-400 dark:border-b-white dark:text-white"
            value={state.installmentCount}
            onChangeText={state.setInstallmentCount}
          />
        </View>
      )}
    </View>
  );
}

export function useScreen(
  initialValues: Partial<{
    description: string;
    value: number | null;
    isRepeated: boolean;
    isInstallments: boolean;
    installmentCount: string;
  }> = {},
) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const [description, setDescription] = useState(
    initialValues.description ?? "",
  );
  const [value, setValue] = useState<number | null>(
    initialValues.value ?? null,
  );
  const [isRepeated, setIsRepeated] = useState(
    initialValues.isRepeated ?? false,
  );
  const [isInstallments, setIsInInstallments] = useState(
    initialValues.isInstallments ?? false,
  );
  const [installmentCount, setInstallmentCount] = useState(
    initialValues.installmentCount ?? "0",
  );

  return {
    description,
    setDescription,
    value,
    setValue,
    isRepeated,
    setIsRepeated,
    isInstallments,
    setIsInInstallments,
    installmentCount,
    setInstallmentCount,
  };
}
