import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

type AnimationConfig = {
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
  useNativeDriver?: boolean;
};

/**
 * Hook for creating and managing common animations
 * @returns Animation utility functions
 */
export function useAnimation() {
  // Fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Rotation animation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  /**
   * Fade in animation
   */
  const fadeIn = (config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Fade out animation
   */
  const fadeOut = (config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Scale up animation
   */
  const scaleUp = (toValue: number = 1.2, config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(scaleAnim, {
      toValue,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Scale down animation
   */
  const scaleDown = (toValue: number = 1, config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(scaleAnim, {
      toValue,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Slide in animation
   */
  const slideIn = (fromValue: number = 100, config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    slideAnim.setValue(fromValue);
    return Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Slide out animation
   */
  const slideOut = (toValue: number = 100, config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.ease, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(slideAnim, {
      toValue,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Rotate animation
   */
  const rotate = (config?: AnimationConfig) => {
    const { 
      duration = 300, 
      easing = Easing.linear, 
      delay = 0,
      useNativeDriver = true 
    } = config || {};
    
    return Animated.timing(rotateAnim, {
      toValue: 1,
      duration,
      easing,
      delay,
      useNativeDriver,
    });
  };

  /**
   * Reset all animations to their initial values
   */
  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(1);
    slideAnim.setValue(0);
    rotateAnim.setValue(0);
  };

  return {
    // Animation values
    fadeAnim,
    scaleAnim,
    slideAnim,
    rotateAnim,
    rotateInterpolate,
    
    // Animation functions
    fadeIn,
    fadeOut,
    scaleUp,
    scaleDown,
    slideIn,
    slideOut,
    rotate,
    resetAnimations,
  };
} 