import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export function Loading() {
  const { t } = useTranslation();

  return (
    <View className="flex h-full items-center justify-center">
      <Text>{t("loading")}</Text>
    </View>
  );
}
