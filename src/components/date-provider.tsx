import { useLocalSearchParams } from "expo-router";
import { createContext, useContext } from "react";

interface DateState {
  asString: string;
  asMonth: Temporal.PlainYearMonth;
}

const DateContext = createContext<DateState | null>(null);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const { dateString: asString } = useLocalSearchParams<{
    dateString: string;
  }>();
  const asMonth = Temporal.PlainYearMonth.from(asString);

  return <DateContext value={{ asString, asMonth }}>{children}</DateContext>;
}

export function useMonth() {
  const ctx = useContext(DateContext);
  return ctx!;
}
