import { Image } from "expo-image";
import * as NativeSplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { BrandColors } from "@/constants/theme";

const LOGO_SIZE = 180;
const GLOW_OUTER = LOGO_SIZE + 100;
const GLOW_MIDDLE = LOGO_SIZE + 70;
const GLOW_INNER = LOGO_SIZE + 40;

const FADE_IN_MS = 800;
const HOLD_MS = 2800;
const FADE_OUT_MS = 600;

type AnimatedSplashProps = {
  onFinish: () => void;
};

export const AnimatedSplash = ({ onFinish }: AnimatedSplashProps) => {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(1);

  // Shared values are stable refs — no need to list as deps
  useEffect(() => {
    NativeSplashScreen.hideAsync();

    logoOpacity.value = withTiming(1, { duration: FADE_IN_MS });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    glowOpacity.value = withDelay(200, withTiming(1, { duration: FADE_IN_MS }));
    glowScale.value = withDelay(
      200,
      withSequence(
        withSpring(1, { damping: 15, stiffness: 80 }),
        withDelay(
          400,
          withRepeat(
            withSequence(
              withTiming(1.06, {
                duration: 1200,
                easing: Easing.inOut(Easing.ease),
              }),
              withTiming(0.94, {
                duration: 1200,
                easing: Easing.inOut(Easing.ease),
              }),
            ),
            -1,
            true,
          ),
        ),
      ),
    );

    containerOpacity.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
  }, [
    containerOpacity,
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    onFinish,
  ]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.center}>
        <Animated.View style={[styles.glowWrapper, glowStyle]}>
          <View style={[styles.glowRing, styles.glowOuter]} />
          <View style={[styles.glowRing, styles.glowMiddle]} />
          <View style={[styles.glowRing, styles.glowInner]} />
        </Animated.View>

        <Animated.View style={[styles.logoShadow, logoStyle]}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.splash,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  glowWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
  },
  glowOuter: {
    width: GLOW_OUTER,
    height: GLOW_OUTER,
    borderRadius: GLOW_OUTER / 2,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  glowMiddle: {
    width: GLOW_MIDDLE,
    height: GLOW_MIDDLE,
    borderRadius: GLOW_MIDDLE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  glowInner: {
    width: GLOW_INNER,
    height: GLOW_INNER,
    borderRadius: GLOW_INNER / 2,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  logoShadow: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
