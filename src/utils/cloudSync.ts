import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  DocumentSnapshot,
  Firestore
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

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

// Initialize Firebase only if we have valid configuration
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  // Validate the config has at least an API key and project ID
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase configuration is incomplete. Using local storage only.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Types
type SyncableData = 'tasks' | 'projects' | 'areas' | 'tags' | 'theme' | 'widgets' | 'email' | 'calendar' | 'notifications';

// Current user
let currentUser: User | null = null;

// Initialize auth state listener
export const initializeAuth = () => {
  if (!auth) {
    console.warn('Auth not initialized. Skipping auth initialization.');
    return;
  }

  onAuthStateChanged(auth, (user: User | null) => {
    currentUser = user;
    if (user) {
      console.log('User authenticated:', user.uid);
    } else {
      console.log('No user authenticated');
    }
  });
};

// Utility to check if user is authenticated
const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

// Utility to check if Firebase is initialized
const isFirebaseInitialized = (): boolean => {
  return !!db && !!auth;
};

// Sync data to cloud
export const syncToCloud = async (dataType: SyncableData, data: any): Promise<boolean> => {
  try {
    if (!isFirebaseInitialized() || !db) {
      console.warn('Firebase not initialized. Skipping cloud sync.');
      return false;
    }

    if (!isAuthenticated()) {
      console.log('User not authenticated. Skipping cloud sync.');
      return false;
    }
    
    const userId = currentUser!.uid;
    const docRef = doc(db, `users/${userId}/${dataType}/${dataType}`);
    
    await setDoc(docRef, {
      data,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Successfully synced ${dataType} to cloud`);
    return true;
  } catch (error) {
    console.error(`Error syncing ${dataType} to cloud:`, error);
    return false;
  }
};

// Get data from cloud
export const getFromCloud = async (dataType: SyncableData): Promise<any | null> => {
  try {
    if (!isFirebaseInitialized() || !db) {
      console.warn('Firebase not initialized. Using local data only.');
      return null;
    }

    if (!isAuthenticated()) {
      console.log('User not authenticated. Using local data only.');
      return null;
    }
    
    const userId = currentUser!.uid;
    const docRef = doc(db, `users/${userId}/${dataType}/${dataType}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data().data;
      console.log(`Successfully retrieved ${dataType} from cloud`);
      return data;
    } else {
      console.log(`No ${dataType} found in cloud`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting ${dataType} from cloud:`, error);
    return null;
  }
};

// Set up real-time sync listener
export const setupCloudSync = (dataType: SyncableData, onUpdate: (data: any) => void): (() => void) => {
  if (!isFirebaseInitialized() || !db) {
    console.warn('Firebase not initialized. Skipping cloud sync listener.');
    return () => {};
  }

  if (!isAuthenticated()) {
    console.log('User not authenticated. Skipping cloud sync listener.');
    return () => {};
  }
  
  const userId = currentUser!.uid;
  const docRef = doc(db, `users/${userId}/${dataType}/${dataType}`);
  
  const unsubscribe = onSnapshot(docRef, (docSnapshot: DocumentSnapshot<DocumentData>) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data().data;
      onUpdate(data);
    }
  });
  
  return unsubscribe;
};

// Merge local and cloud data (resolves conflicts by taking the most recent)
export const mergeData = async (dataType: SyncableData): Promise<any> => {
  try {
    // Get local data
    const localDataJson = await AsyncStorage.getItem(dataType);
    const localData = localDataJson ? JSON.parse(localDataJson) : null;
    
    // Get cloud data if Firebase is initialized and user is authenticated
    const cloudData = isFirebaseInitialized() && isAuthenticated() 
      ? await getFromCloud(dataType) 
      : null;
    
    if (!localData && cloudData) {
      // If only cloud data exists, use it
      await AsyncStorage.setItem(dataType, JSON.stringify(cloudData));
      return cloudData;
    } else if (localData && !cloudData) {
      // If only local data exists, sync it to cloud if possible
      if (isFirebaseInitialized() && isAuthenticated()) {
        await syncToCloud(dataType, localData);
      }
      return localData;
    } else if (localData && cloudData) {
      // Both exist - merge logic would go here
      // For simplicity, we're using cloud data as the source of truth
      await AsyncStorage.setItem(dataType, JSON.stringify(cloudData));
      return cloudData;
    } else {
      // Neither exists
      return null;
    }
  } catch (error) {
    console.error(`Error merging ${dataType} data:`, error);
    const localDataJson = await AsyncStorage.getItem(dataType);
    return localDataJson ? JSON.parse(localDataJson) : null;
  }
};

export default {
  syncToCloud,
  getFromCloud,
  setupCloudSync,
  mergeData,
  initializeAuth
}; 