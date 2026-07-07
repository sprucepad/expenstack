import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex gap-5 p-4">
      <StyledText>&copy; 2026 sprucepad, MIT License</StyledText>
      <StyledText>{t("about.madeWith")}</StyledText>
      <StyledText>{t("about.donateMessage")}</StyledText>
      <Button
        onPress={async () =>
          await WebBrowser.openBrowserAsync(
            "https://www.buymeacoffee.com/sprucepad",
          )
        }
      >
        <StyledText className="text-center uppercase">
          {t("about.donateButton")}
        </StyledText>
      </Button>
    </View>
  );
}

function StyledText({ className, ...rest }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("text-black dark:text-white", className)} {...rest} />
  );
}
