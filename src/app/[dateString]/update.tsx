import { Button } from "@/components/ui/button";
import { useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

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

  return (
    <View className="flex h-full justify-between">
      <View></View>
      <View className="flex gap-4 p-4">
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
