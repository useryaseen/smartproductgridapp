import { Pressable, StyleSheet, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function IconButton({
  icon,
  onPress,
  disabled,
  accessibilityLabel,
  variant = "outlined",
}) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  // Determine colors based on state and variant
  let bg, fg, borderColor;

  if (variant === "solid") {
    // Solid variant: Blue when enabled, light gray when disabled
    bg = disabled ? colors.surface2 : colors.tint;
    fg = disabled ? colors.mutedText : colors.surface;
    borderColor = disabled ? colors.border : colors.tint;
  } else {
    // outlined variant: Light background, blue icon when enabled
    bg = colors.surface2;
    fg = disabled ? colors.icon : colors.tint;
    borderColor = disabled ? colors.border : colors.tint;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor },
        pressed && !disabled ? styles.pressed : undefined,
        disabled ? styles.disabled : undefined,
      ]}
    >
      <View style={styles.inner}>
        <IconSymbol name={icon} size={20} color={fg} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
