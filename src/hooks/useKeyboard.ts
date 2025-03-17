import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

// Define ScreenRect interface since it's not exported from react-native
interface ScreenRect {
  screenX: number;
  screenY: number;
  width: number;
  height: number;
}

interface KeyboardState {
  keyboardShown: boolean;
  keyboardHeight: number;
  keyboardAnimationDuration: number;
  keyboardCoordinates: ScreenRect | null;
}

/**
 * Hook for handling keyboard events and state
 * @returns Keyboard state and utility functions
 */
export function useKeyboard() {
  // Initialize keyboard state
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardShown: false,
    keyboardHeight: 0,
    keyboardAnimationDuration: 250,
    keyboardCoordinates: null,
  });

  useEffect(() => {
    // Define event handlers
    const handleKeyboardWillShow = (event: KeyboardEvent) => {
      setKeyboardState({
        keyboardShown: true,
        keyboardHeight: event.endCoordinates.height,
        keyboardAnimationDuration: event.duration,
        keyboardCoordinates: event.endCoordinates,
      });
    };

    const handleKeyboardDidShow = (event: KeyboardEvent) => {
      setKeyboardState({
        keyboardShown: true,
        keyboardHeight: event.endCoordinates.height,
        keyboardAnimationDuration: event.duration,
        keyboardCoordinates: event.endCoordinates,
      });
    };

    const handleKeyboardWillHide = (event: KeyboardEvent) => {
      setKeyboardState({
        keyboardShown: false,
        keyboardHeight: 0,
        keyboardAnimationDuration: event.duration,
        keyboardCoordinates: null,
      });
    };

    const handleKeyboardDidHide = () => {
      setKeyboardState({
        keyboardShown: false,
        keyboardHeight: 0,
        keyboardAnimationDuration: 250,
        keyboardCoordinates: null,
      });
    };

    // Set up event listeners based on platform
    let keyboardWillShowListener: any;
    let keyboardWillHideListener: any;
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    if (Platform.OS === 'ios') {
      // iOS provides will show/hide events
      keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        handleKeyboardWillShow
      );
      keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        handleKeyboardWillHide
      );
    } else {
      // Android only provides did show/hide events
      keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        handleKeyboardDidShow
      );
      keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        handleKeyboardDidHide
      );
    }

    // Clean up event listeners
    return () => {
      if (Platform.OS === 'ios') {
        keyboardWillShowListener?.remove();
        keyboardWillHideListener?.remove();
      } else {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      }
    };
  }, []);

  /**
   * Dismiss the keyboard
   */
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  /**
   * Calculate padding to avoid keyboard
   * @param extraPadding Additional padding to add (optional)
   * @returns Bottom padding value to avoid keyboard
   */
  const getKeyboardAvoidingPadding = (extraPadding: number = 0): number => {
    return keyboardState.keyboardShown ? keyboardState.keyboardHeight + extraPadding : extraPadding;
  };

  return {
    ...keyboardState,
    dismissKeyboard,
    getKeyboardAvoidingPadding,
  };
} 