import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if we have the auth instance
    const auth = getAuth();
    if (!auth) {
      console.error('Firebase Auth not initialized');
      setIsLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoading(false);
      
      // If we have a user, store their email for future auto-login suggestions
      if (user?.email) {
        await AsyncStorage.setItem('lastUserEmail', user.email);
      }
    });

    // Check if we previously had an email stored for auto-login suggestions
    AsyncStorage.getItem('lastUserEmail').then(email => {
      if (email) {
        console.log('Last logged in user:', email);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
      Alert.alert('Sign Up Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    
    try {
      const auth = getAuth();
      if (!auth) throw new Error('Firebase Auth not initialized');
      
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      Alert.alert('Sign Out Error', error.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 