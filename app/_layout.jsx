import { Stack } from "expo-router";
import { UserContext } from "../context/userContext";

export default function RootLayout() {
  return (
    <UserContext>
      <Stack screenOptions={{ headerShown: false }} />
    </UserContext>
  );
}
