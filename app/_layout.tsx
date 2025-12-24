import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
  useFonts,
} from "@expo-google-fonts/outfit";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider, useSession } from "../context/AuthContext";
import { queryClient } from "../services/api/queryClient";
import { setSessionExpirationHandler } from "../services/api/sessionHandler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, signOut } = useSession();

  // Set up session expiration handler
  useEffect(() => {
    setSessionExpirationHandler(() => {
      // Sign out from context - routing will be handled automatically by Stack.Protected guards
      signOut();
    });
  }, [signOut]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Refetch all queries when app comes to foreground (critical for financial apps)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          // When app comes to foreground, refetch all active queries
          // This ensures users always see fresh financial data
          queryClient.refetchQueries();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <RootLayoutNav />
        </SessionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
