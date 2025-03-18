import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';

// Import actual stores using the @ path alias
import useThemeStore from '@/src/store/themeStore';
import useTaskStore from '@/src/store/taskStore';
// Import cloud sync utility
import cloudSync from '@/src/utils/cloudSync';
// Import Firebase messaging utility
import firebaseMessaging from '@/src/utils/firebaseMessaging';
// Import AuthProvider
import { AuthProvider, useAuth } from '@/src/components/AuthProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Initialize Firebase
const initializeFirebase = () => {
  try {
    // Get Firebase config from Expo Constants
    const extra = Constants.expoConfig?.extra;
    if (!extra) {
      console.warn('Missing Expo configuration in Constants.');
      return;
    }

    const firebaseConfig = {
      apiKey: extra.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: extra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: extra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: extra.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    // Log the Firebase config for debugging
    console.log('Firebase Config:', JSON.stringify(firebaseConfig, null, 2));

    // Check if essential Firebase config values are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration is incomplete. Some features may not work correctly.');
      return;
    }

    // Initialize Firebase
    initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

// Initialize Firebase when app starts
initializeFirebase();

function RootLayoutNav() {
  // Get theme from store
  const { theme, isDarkMode, initializeTheme } = useThemeStore();
  
  // Initialize task store with proper type selection
  const initializeTaskStore = useTaskStore(state => state.initializeState);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Get authentication state
  const { user, isLoading } = useAuth();

  // Initialize stores and hide splash screen when loaded
  useEffect(() => {
    const initialize = async () => {
      // Initialize Firebase Auth
      cloudSync.initializeAuth();
      
      // Initialize theme state from AsyncStorage and cloud
      await initializeTheme();
      
      // Initialize task state from AsyncStorage and cloud
      await initializeTaskStore();
      
      // Setup push notifications
      firebaseMessaging.setupPushNotifications();
      
      if (loaded) {
        SplashScreen.hideAsync();
      }
    };
    
    initialize();
  }, [loaded]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack>
          {!user ? (
            // Auth screens
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          ) : (
            // App screens
            <>
              {/* Main tabs */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              
              {/* Settings screens */}
              <Stack.Screen name="settings/account" options={{ title: 'Account Settings' }} />
              <Stack.Screen name="settings/theme" options={{ title: 'Theme Settings' }} />
              <Stack.Screen name="settings/notifications" options={{ title: 'Notification Settings' }} />
              <Stack.Screen name="settings/email" options={{ title: 'Email Settings' }} />
              <Stack.Screen name="settings/calendar" options={{ title: 'Calendar Settings' }} />
              <Stack.Screen name="settings/shortcuts" options={{ title: 'Siri Shortcuts' }} />
              <Stack.Screen name="settings/about" options={{ title: 'About Acta' }} />
              
              {/* Error screen */}
              <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
            </>
          )}
        </Stack>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
