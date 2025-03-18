import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';

// Only import Firebase messaging in web environment, and only if the browser supports it
let getMessaging: any = null;
let getToken: any = null;
let onMessage: any = null;

// Define a type for the messaging payload
interface MessagingPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
  from?: string;
  // Add other fields as needed
}

// Function to get Firebase config from app.config.js
const getFirebaseConfig = () => {
  const extra = Constants.expoConfig?.extra;
  if (!extra) {
    console.warn('Missing Expo configuration in Constants.');
    return null;
  }

  return {
    apiKey: extra.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID, 
    storageBucket: extra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: extra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: extra.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
};

// Initialize Firebase - only used for web platforms
let messaging: any = null;

// Check if Firebase messaging is supported in this environment
const isFirebaseMessagingSupported = (): boolean => {
  try {
    if (Platform.OS !== 'web') {
      return false;
    }
    
    // Check if we're in a browser environment that supports Firebase messaging
    if (typeof window === 'undefined' || 
        typeof navigator === 'undefined' || 
        !('serviceWorker' in navigator)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Firebase Messaging support:', error);
    return false;
  }
};

// Only initialize Firebase messaging if supported
if (isFirebaseMessagingSupported()) {
  try {
    // Dynamically import Firebase messaging
    const importFirebaseMessaging = async () => {
      try {
        const firebaseMessagingModule = await import('firebase/messaging');
        getMessaging = firebaseMessagingModule.getMessaging;
        getToken = firebaseMessagingModule.getToken;
        onMessage = firebaseMessagingModule.onMessage;
        
        const firebaseConfig = getFirebaseConfig();
        if (firebaseConfig) {
          const app = initializeApp(firebaseConfig);
          messaging = getMessaging(app);
          console.log('Firebase Messaging initialized successfully');
        }
      } catch (error) {
        console.error('Error importing Firebase Messaging:', error);
      }
    };
    
    importFirebaseMessaging();
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

/**
 * Registers the device for push notifications and returns the token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Request notification permissions (required for iOS)
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token: Permission not granted!');
      return null;
    }

    // Get the token
    if (Platform.OS === 'web' && messaging && getToken) {
      try {
        // Use Firebase Messaging for web
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR_HERE', // Add your web push certificate key here for web push
        });
        console.log('Firebase messaging token:', token);
        return token;
      } catch (error) {
        console.error('Error getting Firebase messaging token:', error);
        return null;
      }
    } else {
      // Use Expo's push notification service for native platforms
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.warn('Missing EAS Project ID in Constants, notifications may not work correctly');
        }
        
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })).data;
        console.log('Expo push token:', token);
        return token;
      } catch (error) {
        console.error('Error getting Expo push token:', error);
        return null;
      }
    }
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Sets up a listener for incoming messages when the app is in the foreground
 */
export const setupPushNotifications = () => {
  // Set notification handler for when notifications are received while app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true, 
      shouldSetBadge: true,
    }),
  });

  // Listen for notification events
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received in foreground:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response received:', response);
    // Handle notification response (e.g., navigate to specific screen)
  });

  // For web, set up Firebase onMessage listener
  if (Platform.OS === 'web' && messaging && onMessage) {
    try {
      onMessage(messaging, (payload: MessagingPayload) => {
        console.log('Message received in foreground:', payload);
        // Display the message
      });
    } catch (error) {
      console.error('Error setting up Firebase onMessage listener:', error);
    }
  }

  // Return a cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

export default {
  registerForPushNotifications,
  setupPushNotifications,
  isFirebaseMessagingSupported,
}; 