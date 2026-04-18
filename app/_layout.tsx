import { SystemColorTheme as Colors } from "@/styles/system-color-theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{headerStyle: {backgroundColor: Colors.Primary}, headerTintColor: Colors.Secondary, headerTitleStyle: {fontWeight: "bold", fontSize: 24}}}>
        <Stack.Screen name="index" options={{ headerTitle: "Overview" }} />
      </Stack>
      <StatusBar style="light"/>
    </>
  );
}
