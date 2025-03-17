import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// Import actual stores using the @ path alias
import useThemeStore from '@/src/store/themeStore';
import useTaskStore from '@/src/store/taskStore';
// Import cloud sync utility
import cloudSync from '@/src/utils/cloudSync';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Get theme from store
  const { theme, isDarkMode, initializeTheme } = useThemeStore();
  
  // Initialize task store with proper type selection
  const initializeTaskStore = useTaskStore(state => state.initializeState);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize stores and hide splash screen when loaded
  useEffect(() => {
    const initialize = async () => {
      // Initialize Firebase Auth
      cloudSync.initializeAuth();
      
      // Initialize theme state from AsyncStorage and cloud
      await initializeTheme();
      
      // Initialize task state from AsyncStorage and cloud
      await initializeTaskStore();
      
      if (loaded) {
        SplashScreen.hideAsync();
      }
    };
    
    initialize();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
