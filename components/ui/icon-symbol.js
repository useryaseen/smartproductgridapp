// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bag.fill': 'shopping-bag',
  'info.circle.fill': 'info',
  'magnifyingglass': 'search',
  'line.3.horizontal.decrease.circle': 'tune',
  'arrow.up.arrow.down': 'sort',
  'arrow.uturn.left': 'undo',
  'arrow.uturn.right': 'redo',
  'pencil': 'edit',
  'star.fill': 'star',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}) {
  const iconName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={[styles.fix, style]} />;
}

const styles = StyleSheet.create({
  fix: { includeFontPadding: false },
});
