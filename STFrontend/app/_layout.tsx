import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ActiveRoleProvider } from "@/components/ActiveRoleContext";
import { SafeAreaView } from "react-native-safe-area-context";

function AppContent() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (isLoading || !fontsLoaded) {
    // Show loading spinner if auth or fonts are loading
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ActiveRoleProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fff" }}
          edges={["top"]}
        >
          <Stack>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="listing-details/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="forms" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ActiveRoleProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
