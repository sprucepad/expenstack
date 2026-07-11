import { DateProvider, useMonth } from "@/components/date-provider";
import { StyledSymbol } from "@/components/ui/symbol";
import { defaultLocaleCode } from "@/i18n";
import { router } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

export default function DateLayout() {
  const { t } = useTranslation();

  return (
    <DateProvider>
      <View>
        <DatePicker />
      </View>
      <NativeTabs>
        <NativeTabs.Trigger name="(home)/index">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>{t("main.title")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(details)">
          <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add" />
          <NativeTabs.Trigger.Label>
            {t("update.tabBar")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(graphs)/index" disabled>
          <NativeTabs.Trigger.Icon sf="chart.pie.fill" md="pie_chart" />
          <NativeTabs.Trigger.Label>
            {t("graphs.title")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </DateProvider>
  );
}

function DatePicker() {
  const month = useMonth();

  return (
    <View className="flex flex-row justify-between bg-gray-200 p-4 dark:bg-gray-700">
      <Pressable
        onPress={() => {
          const dateString = month.asMonth.subtract({ months: 1 }).toString();
          router.replace({ pathname: "/[dateString]", params: { dateString } });
        }}
      >
        <StyledSymbol
          name={{ ios: "arrow.left", android: "arrow_left" }}
          className="text-black dark:text-white"
        />
      </Pressable>

      <Text className="text-black dark:text-white">
        {month.asMonth.toLocaleString(defaultLocaleCode, {
          calendar: "iso8601",
          month: "long",
          year: "numeric",
        })}
      </Text>

      <Pressable
        onPress={() => {
          const dateString = month.asMonth.add({ months: 1 }).toString();
          router.replace({ pathname: "/[dateString]", params: { dateString } });
        }}
      >
        <StyledSymbol
          name={{ ios: "arrow.right", android: "arrow_right" }}
          className="text-black dark:text-white"
        />
      </Pressable>
    </View>
  );
}
