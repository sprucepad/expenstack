import "@/global.css";
import "@/i18n";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import "temporal-polyfill/global";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { t } = useTranslation();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="[dateString]"
          options={{ title: t("main.title") }}
        />
      </Stack>
    </ThemeProvider>
  );
}
