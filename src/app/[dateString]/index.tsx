import { useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function ExpenseListScreen() {
  const { dateString } = useLocalSearchParams();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View>
      <Text className="text-white">{dateString}</Text>
    </View>
  );
}
