# Acta Hooks

This directory contains reusable React hooks for the Acta task management application.

## Available Hooks

### `useForm`
A hook for managing form state and validation.
```typescript
const { 
  values, errors, touched, 
  handleChange, handleBlur, 
  resetForm, validateForm, setValues 
} = useForm(initialValues, validateFn);
```

### `useDebounce`
A hook that provides a debounced value, useful for search inputs and other frequently changing values.
```typescript
const debouncedValue = useDebounce(value, delay);
```

### `useStorage`
A hook for managing data in AsyncStorage with type safety.
```typescript
const [storedValue, setValue, loading, error] = useStorage(key, initialValue);
```

### `useAnimation`
A hook for creating and managing common animations.
```typescript
const { 
  fadeAnim, scaleAnim, slideAnim, rotateAnim, rotateInterpolate,
  fadeIn, fadeOut, scaleUp, scaleDown, slideIn, slideOut, rotate, resetAnimations
} = useAnimation();
```

### `useTheme`
A hook for managing theme settings and appearance.
```typescript
const { 
  themeSettings, loading, isDarkMode, colors,
  setThemeMode, setAccentColor, toggleTrueBlack
} = useTheme();
```

### `useNotifications`
A hook for managing notification permissions and settings.
```typescript
const {
  settings, loading, permissionStatus,
  checkPermissions, requestPermissions, updateSettings,
  toggleNotifications, scheduleTaskReminder, scheduleDailySummary,
  cancelNotification, cancelAllNotifications, isInQuietHours
} = useNotifications();
```

### `useKeyboard`
A hook for handling keyboard events and state.
```typescript
const {
  keyboardShown, keyboardHeight, keyboardAnimationDuration, keyboardCoordinates,
  dismissKeyboard, getKeyboardAvoidingPadding
} = useKeyboard();
```

### `useNetwork`
A hook for monitoring network connectivity.
```typescript
const {
  isConnected, connectionType, isInternetReachable, details, isFirstCheck,
  checkConnection, getConnectionStatusMessage, isWifi, isMetered
} = useNetwork();
```

## Usage

Import hooks directly from the hooks directory:

```typescript
import { useForm, useTheme, useNotifications } from '../hooks';

function MyComponent() {
  const { colors, isDarkMode } = useTheme();
  // ...
}
``` 