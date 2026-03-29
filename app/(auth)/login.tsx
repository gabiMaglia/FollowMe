import * as Google from "expo-auth-session/providers/google";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandColors } from "@/constants/theme";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useThemeColor } from "@/hooks/use-theme-color";
import { isValidEmail } from "@/src/domain/value-objects/email";
import { isValidPassword } from "@/src/domain/value-objects/password";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");

  const [_request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      Alert.alert("Error", "Could not get Google ID token. Please try again.");
      return;
    }

    const handleToken = async () => {
      clearError();
      try {
        await loginWithGoogle(idToken);
        router.replace("/");
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    handleToken();
  }, [response]);

  const isFormValid = isValidEmail(email) && isValidPassword(password);

  const handleLogin = async () => {
    if (!isFormValid || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();

    try {
      await login(email, password);
      router.replace("/");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGoogleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();
    promptAsync();
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="title">Welcome back</ThemedText>
              <ThemedText style={styles.subtitle}>
                Sign in to continue
              </ThemedText>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: iconColor,
                      backgroundColor,
                    },
                  ]}
                  placeholder="john@example.com"
                  placeholderTextColor={iconColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: iconColor,
                      backgroundColor,
                    },
                  ]}
                  placeholder="Your password"
                  placeholderTextColor={iconColor}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  editable={!isLoading}
                />
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={!isFormValid || isLoading}
                style={({ pressed }) => [
                  styles.button,
                  styles.loginButton,
                  (!isFormValid || isLoading) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </ThemedText>
              </Pressable>

              <View style={styles.divider}>
                <View
                  style={[styles.dividerLine, { backgroundColor: iconColor }]}
                />
                <ThemedText style={styles.dividerText}>or</ThemedText>
                <View
                  style={[styles.dividerLine, { backgroundColor: iconColor }]}
                />
              </View>

              <Pressable
                onPress={handleGoogleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.button,
                  styles.googleButton,
                  { borderColor: iconColor },
                  pressed && styles.buttonPressed,
                ]}
              >
                <ThemedText style={styles.googleButtonText}>
                  Continue with Google
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <ThemedText>Don&apos;t have an account? </ThemedText>
              <Link href="/(auth)/register">
                <ThemedText type="link">Sign Up</ThemedText>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  subtitle: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    minHeight: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  loginButton: {
    backgroundColor: BrandColors.splash,
    marginTop: 8,
  },
  googleButton: {
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    opacity: 0.5,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
});
