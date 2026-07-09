import { Text, View } from "react-native";

export function QueryError({ error }: { error: Error }) {
  return (
    <View className="flex items-center justify-center gap-4 p-8">
      <Text className="text-2xl font-black text-black dark:text-white">
        An error occurred:
      </Text>
      <Text className="text-black dark:text-white">{error.message}</Text>
    </View>
  );
}
