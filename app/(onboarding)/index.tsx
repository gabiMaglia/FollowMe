import DateTimePicker, {
    type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandColors } from "@/constants/theme";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useThemeColor } from "@/hooks/use-theme-color";
import { OnboardingAlreadyCompletedError } from "@/src/domain/errors/auth-errors";
import { isValidDateOfBirth } from "@/src/domain/value-objects/date-of-birth";

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);
const INITIAL_DATE = new Date(2005, 0, 1);

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [date, setDate] = useState(INITIAL_DATE);
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");
  const [isMinorMessage, setIsMinorMessage] = useState<string | null>(null);

  const iconColor = useThemeColor({}, "icon");

  const dateString = date.toISOString().split("T")[0];
  const isFormValid = isValidDateOfBirth(dateString);

  const displayDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      clearError();
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearError();

    try {
      const result = await completeOnboarding(dateString);

      if (result.isMinor) {
        setIsMinorMessage(
          "Your account will have additional safety restrictions because you are under 16.",
        );
        setTimeout(() => {
          router.replace("/");
        }, 3000);
      } else {
        router.replace("/");
      }
    } catch (e) {
      if (e instanceof OnboardingAlreadyCompletedError) {
        router.replace("/");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title">One last thing</ThemedText>
            <ThemedText style={styles.subtitle}>
              When is your birthday? This helps us keep you safe.
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {isMinorMessage ? (
            <View style={styles.minorContainer}>
              <ThemedText style={styles.minorText}>{isMinorMessage}</ThemedText>
            </View>
          ) : null}

          <View style={styles.dateSection}>
            {Platform.OS === "android" ? (
              <Pressable
                onPress={() => setShowPicker(true)}
                style={[styles.dateButton, { borderColor: iconColor }]}
              >
                <ThemedText style={styles.dateText}>{displayDate}</ThemedText>
              </Pressable>
            ) : null}

            {showPicker ? (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={MAX_DATE}
                minimumDate={MIN_DATE}
              />
            ) : null}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading || isMinorMessage !== null}
              style={({ pressed }) => [
                styles.button,
                (!isFormValid || isLoading || isMinorMessage !== null) &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? "Saving..." : "Continue"}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert("Log out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Log out",
                    style: "destructive",
                    onPress: async () => {
                      await logout();
                      router.replace("/login");
                    },
                  },
                ]);
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    gap: 12,
    marginBottom: 40,
    alignItems: "center",
  },
  subtitle: {
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 22,
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
  minorContainer: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  minorText: {
    color: "#A16207",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  dateSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 220,
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
  },
  footer: {
    gap: 16,
  },
  button: {
    backgroundColor: BrandColors.splash,
    minHeight: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
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
  logoutButton: {
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
});
