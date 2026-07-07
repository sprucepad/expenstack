import { DateProvider } from "@/components/date-provider";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

export default function DateLayout() {
  const { t } = useTranslation();

  return (
    <DateProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
          <NativeTabs.Trigger.Label>{t("main.title")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(update)/add">
          <NativeTabs.Trigger.Icon sf="plus.circle.fill" md="add" />
          <NativeTabs.Trigger.Label>
            {t("update.tabBar")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="graphs" disabled>
          <NativeTabs.Trigger.Icon sf="chart.pie.fill" md="pie_chart" />
          <NativeTabs.Trigger.Label>
            {t("graphs.title")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </DateProvider>
  );
}
