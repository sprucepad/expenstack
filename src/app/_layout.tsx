import { db } from "@/db/index";
import "@/global.css";
import "@/i18n";
import migrations from "@drizzle/migrations";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, useColorScheme, View } from "react-native";
import "temporal-polyfill/global";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const { success, error } = useMigrations(db, {
    ...migrations,
    journal: {
      entries: [],
    },
  });

  if (error) {
    return <MigrationError error={error} />;
  }

  if (!success) {
    return (
      <View className="flex items-center justify-center">
        <Text className="dark:font-white font-black">
          Applying migrations...
        </Text>
      </View>
    );
  }

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

function MigrationError({ error }: { error: Error }) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View className="flex items-center justify-center gap-4">
      <Text className="text-2xl font-black text-black dark:text-white">
        An error occurred while migrating:
      </Text>
      <Text>{error.message}</Text>
    </View>
  );
}
