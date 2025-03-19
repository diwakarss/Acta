import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useStorage } from './useStorage';

// Define theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

// Theme settings interface
export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: AccentColor;
  useTrueBlack: boolean;
}

// Default theme settings
const defaultThemeSettings: ThemeSettings = {
  mode: 'system',
  accentColor: 'blue',
  useTrueBlack: false,
};

/**
 * Hook for managing theme settings and appearance
 * @returns Theme settings and functions to update them
 */
export function useTheme() {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // Load theme settings from storage
  const [themeSettings, setThemeSettings, loading] = useStorage<ThemeSettings>(
    'theme-settings',
    defaultThemeSettings
  );

  // Determine the actual theme mode based on settings and system
  const actualThemeMode = themeSettings.mode === 'system' 
    ? systemColorScheme || 'light'
    : themeSettings.mode;

  // Update theme mode
  const setThemeMode = async (mode: ThemeMode) => {
    await setThemeSettings({ ...themeSettings, mode });
  };

  // Update accent color
  const setAccentColor = async (accentColor: AccentColor) => {
    await setThemeSettings({ ...themeSettings, accentColor });
  };

  // Toggle true black mode (for OLED screens)
  const toggleTrueBlack = async () => {
    await setThemeSettings({ ...themeSettings, useTrueBlack: !themeSettings.useTrueBlack });
  };

  // Get colors based on current theme
  const getColors = () => {
    const isDark = actualThemeMode === 'dark';
    
    // Base colors
    const baseColors = {
      // Background colors
      background: isDark 
        ? (themeSettings.useTrueBlack ? '#000000' : '#121212') 
        : '#FFFFFF',
      surface: isDark ? '#1E1E1E' : '#F5F5F5',
      surfaceVariant: isDark ? '#2C2C2C' : '#E1E1E1',
      
      // Text colors
      text: isDark ? '#FFFFFF' : '#000000',
      textSecondary: isDark ? '#AAAAAA' : '#666666',
      textDisabled: isDark ? '#666666' : '#AAAAAA',
      
      // Border colors
      border: isDark ? '#333333' : '#E0E0E0',
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      
      // Status colors
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      info: '#2196F3',
    };
    
    // Accent color palette
    const accentColors = {
      blue: {
        primary: '#2196F3',
        secondary: isDark ? '#90CAF9' : '#1976D2',
        tertiary: isDark ? '#1565C0' : '#BBDEFB',
      },
      purple: {
        primary: '#9C27B0',
        secondary: isDark ? '#CE93D8' : '#7B1FA2',
        tertiary: isDark ? '#6A1B9A' : '#E1BEE7',
      },
      green: {
        primary: '#4CAF50',
        secondary: isDark ? '#A5D6A7' : '#388E3C',
        tertiary: isDark ? '#2E7D32' : '#C8E6C9',
      },
      orange: {
        primary: '#FF9800',
        secondary: isDark ? '#FFCC80' : '#F57C00',
        tertiary: isDark ? '#EF6C00' : '#FFE0B2',
      },
      red: {
        primary: '#F44336',
        secondary: isDark ? '#EF9A9A' : '#D32F2F',
        tertiary: isDark ? '#C62828' : '#FFCDD2',
      },
      pink: {
        primary: '#E91E63',
        secondary: isDark ? '#F48FB1' : '#C2185B',
        tertiary: isDark ? '#AD1457' : '#F8BBD0',
      },
    };
    
    // Get selected accent color
    const accent = accentColors[themeSettings.accentColor];
    
    return {
      ...baseColors,
      ...accent,
      isDark,
    };
  };

  return {
    themeSettings,
    loading,
    isDarkMode: actualThemeMode === 'dark',
    colors: getColors(),
    setThemeMode,
    setAccentColor,
    toggleTrueBlack,
  };
} 