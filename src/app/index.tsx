import { Redirect } from "expo-router";

export default function HomeScreen() {
  return (
    <Redirect
      href={{
        pathname: "/[dateString]",
        params: { dateString: Temporal.Now.plainDateISO().toString() },
      }}
    />
  );
}
