import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { isValidDisplayName } from "@/src/domain/value-objects/display-name";
import { isValidEmail } from "@/src/domain/value-objects/email";
import { isValidPassword } from "@/src/domain/value-objects/password";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");

  const isFormValid =
    isValidEmail(email) &&
    isValidDisplayName(displayName) &&
    isValidPassword(password);

  const handleRegister = async () => {
    if (!isFormValid || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();

    try {
      await register(email, displayName, password);
      router.replace("/");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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
              <ThemedText type="title">Create account</ThemedText>
              <ThemedText style={styles.subtitle}>
                Join FollowMe today
              </ThemedText>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Display Name</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: iconColor,
                      backgroundColor,
                    },
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor={iconColor}
                  autoCapitalize="words"
                  autoComplete="name"
                  value={displayName}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    clearError();
                  }}
                  editable={!isLoading}
                />
                {displayName.length > 0 && !isValidDisplayName(displayName) ? (
                  <ThemedText style={styles.hint}>
                    At least 2 characters
                  </ThemedText>
                ) : null}
              </View>

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
                {email.length > 0 && !isValidEmail(email) ? (
                  <ThemedText style={styles.hint}>
                    Enter a valid email
                  </ThemedText>
                ) : null}
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
                  placeholder="Min. 8 characters"
                  placeholderTextColor={iconColor}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  editable={!isLoading}
                />
                {password.length > 0 && !isValidPassword(password) ? (
                  <ThemedText style={styles.hint}>
                    At least 8 characters
                  </ThemedText>
                ) : null}
              </View>

              <Pressable
                onPress={handleRegister}
                disabled={!isFormValid || isLoading}
                style={({ pressed }) => [
                  styles.button,
                  styles.registerButton,
                  (!isFormValid || isLoading) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <ThemedText>Already have an account? </ThemedText>
              <Link href="/(auth)/login">
                <ThemedText type="link">Sign In</ThemedText>
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
  hint: {
    color: "#DC2626",
    fontSize: 12,
  },
  button: {
    minHeight: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
  },
  registerButton: {
    backgroundColor: BrandColors.splash,
    marginTop: 8,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
});
