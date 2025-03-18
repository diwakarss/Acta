import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

// Configure WebBrowser for auth redirects
WebBrowser.maybeCompleteAuthSession();

// Get environment variables from Expo's Constants
const getEnvVariable = (key: string): string => {
  const value = Constants.expoConfig?.extra?.[key];
  if (!value) {
    console.warn(`Environment variable ${key} not found!`);
    return '';
  }
  return value as string;
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: getEnvVariable('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVariable('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVariable('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVariable('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVariable('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVariable('EXPO_PUBLIC_FIREBASE_APP_ID')
};

// Initialize Firebase app if it hasn't been initialized yet
let app;
try {
  // Check if Firebase is already initialized
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized in AuthProvider');
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase in AuthProvider:', error);
  } else {
    console.log('Firebase already initialized, using existing app');
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize auth with proper error handling
    let unsubscribe = () => {};
    
    try {
      // Get the auth instance
      const auth = getAuth();
      console.log('Setting up auth state listener');
      
      // Listen for auth state changes
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        console.log('Auth state changed:', currentUser ? 'User logged in' : 'No user');
        setUser(currentUser);
        setIsLoading(false);
        
        // If we have a user, store their email for future auto-login suggestions
        if (currentUser?.email) {
          await AsyncStorage.setItem('lastUserEmail', currentUser.email);
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setIsLoading(false);
      });

      // Check if we previously had an email stored for auto-login suggestions
      AsyncStorage.getItem('lastUserEmail').then(email => {
        if (email) {
          console.log('Last logged in user:', email);
        }
      });
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsLoading(false);
      setError('Failed to initialize authentication.');
    }

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with email:', email);
      const auth = getAuth();
      
      // Check if we have the auth instance
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful for user:', userCredential.user.uid);
      
      // You could add additional logic here if needed
    } catch (error: any) {
      console.error('Sign in error:', error.code, error.message);
      
      // Provide more user-friendly error messages based on Firebase error codes
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
      Alert.alert('Sign In Error', errorMessage);
      throw error; // Rethrow to allow callers to handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Attempting to create account with email:', email);
      const auth = getAuth();
      
      // Check if we have the auth instance
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created successfully for user:', userCredential.user.uid);
      
      // You could add additional setup for new users here if needed
    } catch (error: any) {
      console.error('Sign up error:', error.code, error.message);
      
      // Provide more user-friendly error messages based on Firebase error codes
      let errorMessage = 'Failed to create account.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try another email or sign in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Account creation is currently disabled.';
      }
      
      setError(errorMessage);
      Alert.alert('Sign Up Error', errorMessage);
      throw error; // Rethrow to allow callers to handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    
    try {
      console.log('Attempting to sign out');
      const auth = getAuth();
      
      // Check if we have the auth instance
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      await firebaseSignOut(auth);
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error.code, error.message);
      setError('Failed to sign out. Please try again.');
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
      throw error; // Rethrow to allow callers to handle it if needed
    }
  };

  // Add Google Sign-In method
  const signInWithGoogle = async (): Promise<void> => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Attempting to sign in with Google');
      const auth = getAuth();
      
      // Check if we have the auth instance
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Handle platform-specific Google sign-in
      if (Platform.OS === 'web') {
        // Web implementation - uses a popup
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign in successful for user:', result.user.uid);
      } else {
        // Native implementation using Expo AuthSession
        try {
          // Get Firebase project ID from config
          const projectId = firebaseConfig.projectId;
          if (!projectId) {
            throw new Error('Firebase project ID is missing from configuration');
          }
          
          // Get Expo client ID for Google auth
          const expoClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
          const androidClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
          const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
          
          if (!expoClientId && !androidClientId && !iosClientId) {
            Alert.alert(
              'Configuration Error',
              'Google Sign-In client IDs are not configured. Please check your app config.',
              [{ text: 'OK' }]
            );
            setIsLoading(false);
            return;
          }
          
          console.log('Starting Google AuthRequest');
          
          // Configuration for the AuthRequest
          const config: AuthSession.AuthRequestConfig = {
            clientId: Platform.OS === 'android' ? androidClientId : iosClientId,
            scopes: ['profile', 'email'],
            redirectUri: AuthSession.makeRedirectUri({
              scheme: 'acta'
            })
          };
          
          if (expoClientId) {
            // @ts-ignore - Add web client ID which may not be in the type definitions
            config.webClientId = expoClientId;
          }
          
          // Create and prompt the Google auth request
          const request = new AuthSession.AuthRequest(config);
          const result = await request.promptAsync(Google.discovery);
          
          if (result.type === 'success') {
            // Got the user token
            const { id_token } = result.params;
            
            // Sign in with the token
            const credential = GoogleAuthProvider.credential(id_token);
            const userCredential = await signInWithCredential(auth, credential);
            console.log('Google sign-in successful for user:', userCredential.user.uid);
          } else {
            console.log('Google sign-in was cancelled or failed:', result.type);
            if (result.type === 'cancel') {
              throw new Error('Google sign-in was cancelled');
            } else {
              throw new Error(`Google sign-in failed: ${result.type}`);
            }
          }
        } catch (error: any) {
          console.error('Native Google sign-in error:', error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error.code, error.message);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user' || error.message === 'Google sign-in was cancelled') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this website.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'The sign-in process was cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
      }
      
      setError(errorMessage);
      Alert.alert('Google Sign-In Error', errorMessage);
      throw error; // Rethrow to allow callers to handle it if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signOut, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 