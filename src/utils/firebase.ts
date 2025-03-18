import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import Constants from 'expo-constants';

// Helper to get environment variables
const getEnvVariable = (key: string): string => {
  if (Constants?.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] as string;
  }
  if (process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: getEnvVariable('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVariable('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVariable('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVariable('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVariable('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVariable('EXPO_PUBLIC_FIREBASE_APP_ID')
};

// Ensure configuration has essential values
const hasValidConfig = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

// Initialize Firebase
let firebaseApp: FirebaseApp | undefined;
let firestoreDb: Firestore | undefined;
let firebaseAuth: Auth | undefined;

export const initializeFirebase = (): { app: FirebaseApp; db: Firestore; auth: Auth } | undefined => {
  try {
    // Check configuration
    if (!hasValidConfig()) {
      console.warn('Firebase configuration is incomplete. Some features may not work correctly.');
      return undefined;
    }

    // Check if Firebase is already initialized
    if (getApps().length > 0) {
      firebaseApp = getApp();
      console.log('Firebase already initialized, using existing app');
    } else {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }

    // Initialize Firestore and Auth
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);

    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: firebaseAuth
    };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return undefined;
  }
};

// Utility to check if Firebase is initialized
export const isFirebaseInitialized = (): boolean => {
  return getApps().length > 0;
};

// Get Firebase instances
export const getFirebaseApp = (): FirebaseApp | undefined => firebaseApp;
export const getFirestoreDB = (): Firestore | undefined => firestoreDb;
export const getFirebaseAuth = (): Auth | undefined => firebaseAuth;

// Initialize at module level
initializeFirebase(); 