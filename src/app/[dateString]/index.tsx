import { useMonth } from "@/components/date-provider";
import { Text, View } from "react-native";

export default function ExpenseListScreen() {
  const month = useMonth();

  return (
    <View>
      <Text className="text-white">{month.asString}</Text>
    </View>
  );
}
