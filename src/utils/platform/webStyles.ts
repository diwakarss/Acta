import { Platform, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Import CSS only for web platform
if (Platform.OS === 'web') {
  // Using require instead of import ensures the CSS is only loaded on web
  require('@/src/styles/web-styles.css');
}

/**
 * Returns a className string for web platform, or undefined for native platforms
 * This can be used in React Native components for web-specific styling
 * 
 * @param className CSS class name to apply on web
 * @returns className string for web or undefined for native
 */
export const webClassName = (className: string): string | undefined => {
  return Platform.OS === 'web' ? className : undefined;
};

/**
 * Creates props object with className for web platform only
 * This is useful for components that accept className but
 * might break on native platforms if className is provided
 * 
 * @param className CSS class name to apply on web
 * @returns Object with className for web or empty object for native
 */
export const webClassNameProps = (className: string): { className?: string } => {
  return Platform.OS === 'web' ? { className } : {};
};

/**
 * Combines React Native styles with web CSS classes.
 * This allows using a single prop for both platforms.
 * 
 * @param style React Native style object or array
 * @param className CSS class name to apply on web
 * @returns Combined style prop safe for both platforms
 */
export const combineStyles = (
  style: StyleProp<ViewStyle | TextStyle | ImageStyle>,
  className: string
): any => {
  if (Platform.OS === 'web') {
    return { style, className };
  }
  return style;
}; 