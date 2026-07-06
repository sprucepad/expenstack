import { Button } from "@/components/ui/button";
import { moneyFormatter } from "@/lib/formatter";
import { Checkbox } from "expo-checkbox";
import { useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { RadioGroup } from "react-native-radio-buttons-group";

export default function Update() {
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

  return (
    <View className="flex h-full justify-between p-8">
      <View className="flex gap-4">
        <View>
          <Text>{t("update.description")}</Text>
          <TextInput
            ref={descriptionRef}
            placeholder={t("update.descriptionPlaceholder")}
            className="placeholder-text-gray-400 border-b border-b-black text-black dark:border-b-white dark:text-white"
          />
        </View>

        <View>
          <Text>{t("update.value")}</Text>
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
          <Text>{t("update.repeated")}</Text>
        </View>

        {isRepeated && (
          <RadioGroup
            layout="row"
            radioButtons={[
              {
                id: "fixed",
                value: "fixed",
                label: t("update.fixed"),
              },
              {
                id: "installments",
                value: "installments",
                label: t("update.installments"),
              },
            ]}
            selectedId={isInstallments ? "installments" : "fixed"}
            onPress={(id) => setIsInInstallments(id === "installments")}
          />
        )}

        {isRepeated && isInstallments && (
          <View>
            <Text>{t("update.installmentCount")}</Text>
            <TextInput
              keyboardType="number-pad"
              ref={installmentCountRef}
              placeholder="0"
              className="placeholder-text-gray-400 border-b border-b-black text-black dark:border-b-white dark:text-white"
            />
          </View>
        )}
      </View>
      <View className="flex gap-4">
        <Button>
          <Text className="text-center text-black uppercase dark:text-white">
            {expenseId ? t("update.update") : t("update.add")}
          </Text>
        </Button>
        <Button className="will-change-variable" variant="primary">
          <Text className="text-center text-black uppercase dark:text-white">
            {t("update.paid")}
          </Text>
        </Button>
        <Button variant="destructive">
          <Text className="text-center text-black uppercase dark:text-white">
            {t("update.remove")}
          </Text>
        </Button>
      </View>
    </View>
  );
}
