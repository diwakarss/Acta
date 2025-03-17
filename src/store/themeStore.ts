import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { ColorSchemeName } from 'react-native';

// Import cloud sync utilities
import cloudSync from '../utils/cloudSync';

// Adapt navigation theme to work with React Native Paper
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Customize the light theme
const CustomLightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#0a7ea4',
    secondary: '#4ecdc4',
    tertiary: '#f7fff7',
    error: '#ff6b6b',
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceVariant: '#f1f3f5',
    onSurface: '#212529',
    elevation: {
      level0: 'transparent',
      level1: '#f8f9fa',
      level2: '#f1f3f5',
      level3: '#e9ecef',
      level4: '#dee2e6',
      level5: '#ced4da',
    },
  },
};

// Customize the dark theme
const CustomDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#4ecdc4',
    secondary: '#0a7ea4',
    tertiary: '#292f36',
    error: '#ff6b6b',
    background: '#151718',
    surface: '#1e2022',
    surfaceVariant: '#292f36',
    onSurface: '#f8f9fa',
    elevation: {
      level0: 'transparent',
      level1: '#1e2022',
      level2: '#292f36',
      level3: '#343a40',
      level4: '#495057',
      level5: '#6c757d',
    },
  },
};

// Define the theme store state
interface ThemeState {
  isDarkMode: boolean;
  theme: typeof CustomLightTheme | typeof CustomDarkTheme;
  systemTheme: ColorSchemeName;
  useSystemTheme: boolean;
  
  // Theme operations
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setUseSystemTheme: (useSystem: boolean) => void;
  setSystemTheme: (theme: ColorSchemeName) => void;
  
  // Storage operations
  initializeTheme: () => Promise<void>;
  persistTheme: () => Promise<void>;
}

// Create the theme store
const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: false,
  theme: CustomLightTheme,
  systemTheme: 'light',
  useSystemTheme: true,
  
  // Theme operations
  toggleTheme: () => {
    set((state) => {
      const newIsDarkMode = !state.isDarkMode;
      return {
        isDarkMode: newIsDarkMode,
        theme: newIsDarkMode ? CustomDarkTheme : CustomLightTheme,
        useSystemTheme: false,
      };
    });
    
    get().persistTheme();
  },
  
  setTheme: (isDark) => {
    set({
      isDarkMode: isDark,
      theme: isDark ? CustomDarkTheme : CustomLightTheme,
      useSystemTheme: false,
    });
    
    get().persistTheme();
  },
  
  setUseSystemTheme: (useSystem) => {
    set((state) => {
      if (useSystem) {
        const systemIsDark = state.systemTheme === 'dark';
        return {
          useSystemTheme: true,
          isDarkMode: systemIsDark,
          theme: systemIsDark ? CustomDarkTheme : CustomLightTheme,
        };
      }
      
      return { useSystemTheme: false };
    });
    
    get().persistTheme();
  },
  
  setSystemTheme: (theme) => {
    set((state) => {
      const updates: Partial<ThemeState> = { systemTheme: theme };
      
      if (state.useSystemTheme) {
        const systemIsDark = theme === 'dark';
        updates.isDarkMode = systemIsDark;
        updates.theme = systemIsDark ? CustomDarkTheme : CustomLightTheme;
      }
      
      return updates as ThemeState;
    });
    
    get().persistTheme();
  },
  
  // Storage operations
  initializeTheme: async () => {
    try {
      // Try to get merged data from cloud and local storage
      const themeData = await cloudSync.mergeData('theme');
      
      if (themeData) {
        const { isDarkMode, useSystemTheme } = themeData;
        
        if (useSystemTheme) {
          const systemIsDark = get().systemTheme === 'dark';
          set({
            useSystemTheme: true,
            isDarkMode: systemIsDark,
            theme: systemIsDark ? CustomDarkTheme : CustomLightTheme,
          });
        } else {
          set({
            isDarkMode,
            theme: isDarkMode ? CustomDarkTheme : CustomLightTheme,
            useSystemTheme: false,
          });
        }
      }
      
      // Set up real-time syncing
      cloudSync.setupCloudSync('theme', (updatedTheme) => {
        if (updatedTheme) {
          const { isDarkMode, useSystemTheme } = updatedTheme;
          if (useSystemTheme) {
            const systemIsDark = get().systemTheme === 'dark';
            set({
              useSystemTheme: true,
              isDarkMode: systemIsDark,
              theme: systemIsDark ? CustomDarkTheme : CustomLightTheme,
            });
          } else {
            set({
              isDarkMode,
              theme: isDarkMode ? CustomDarkTheme : CustomLightTheme,
              useSystemTheme: false,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing theme store:', error);
      
      // Fall back to local storage if cloud sync fails
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        const { isDarkMode, useSystemTheme } = JSON.parse(storedTheme);
        
        if (useSystemTheme) {
          const systemIsDark = get().systemTheme === 'dark';
          set({
            useSystemTheme: true,
            isDarkMode: systemIsDark,
            theme: systemIsDark ? CustomDarkTheme : CustomLightTheme,
          });
        } else {
          set({
            isDarkMode,
            theme: isDarkMode ? CustomDarkTheme : CustomLightTheme,
            useSystemTheme: false,
          });
        }
      }
    }
  },
  
  persistTheme: async () => {
    try {
      const { isDarkMode, useSystemTheme } = get();
      const themeData = { isDarkMode, useSystemTheme };
      
      // Persist to local storage
      await AsyncStorage.setItem('theme', JSON.stringify(themeData));
      
      // Sync to cloud
      await cloudSync.syncToCloud('theme', themeData);
    } catch (error) {
      console.error('Error persisting theme store:', error);
    }
  },
}));

export default useThemeStore; 