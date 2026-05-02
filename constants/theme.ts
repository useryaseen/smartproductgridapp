/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563EB';
const tintColorDark = '#93C5FD';

export const Colors = {
  light: {
    text: '#0B1220',
    mutedText: '#4B5563',
    background: '#F6F7FB',
    surface: '#FFFFFF',
    surface2: '#F2F4F8',
    border: '#E5E7EB',
    shadow: '#0B1220',
    tint: tintColorLight,
    icon: '#687076',
    danger: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
    focus: '#2563EB',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    mutedText: '#A1A7AE',
    background: '#0B0F17',
    surface: '#121826',
    surface2: '#0F1624',
    border: '#1F2A3A',
    shadow: '#000000',
    tint: tintColorDark,
    icon: '#9BA1A6',
    danger: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24',
    focus: '#93C5FD',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
