import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

// Register background location task — must be imported at module level
import "@/src/adapters/location/background-location-task";

import { AnimatedSplash } from "@/components/splash-screen";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  // Protect routes: redirect based on auth state changes
  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (
      isAuthenticated &&
      !user?.onboardingCompleted &&
      !inOnboardingGroup
    ) {
      router.replace("/(onboarding)");
    } else if (
      isAuthenticated &&
      user?.onboardingCompleted &&
      (inAuthGroup || inOnboardingGroup)
    ) {
      router.replace("/(tabs)");
    }
  }, [
    isAuthenticated,
    isLoading,
    showSplash,
    user?.onboardingCompleted,
    segments,
  ]);

  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="messages/new" />
        <Stack.Screen name="messages/[contactId]" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: true, title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
