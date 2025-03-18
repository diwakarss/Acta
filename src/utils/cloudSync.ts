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
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Type for sync operations that need to be queued when offline
type SyncOperation = {
  id: string;
  dataType: SyncableData;
  data: any;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
  retryCount: number;
};

// Network connectivity state
let isConnected: boolean = true;

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

// Setup network connectivity listener
export const setupConnectivityListener = () => {
  NetInfo.addEventListener((state: NetInfoState) => {
    const previouslyConnected = isConnected;
    isConnected = !!state.isConnected;
    
    if (!previouslyConnected && isConnected) {
      console.log('Connection restored. Processing sync queue...');
      processSyncQueue();
    }
  });
};

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
      // Process any pending sync operations when user signs in
      processSyncQueue();
    } else {
      console.log('No user authenticated');
    }
  });
  
  // Set up network connectivity monitoring
  setupConnectivityListener();
};

// Utility to check if user is authenticated
const isAuthenticated = (): boolean => {
  return currentUser !== null;
};

// Utility to check if Firebase is initialized
const isFirebaseInitialized = (): boolean => {
  return !!db && !!auth;
};

// Utility to check if device is online
const isOnline = (): boolean => {
  return isConnected;
};

// Add operation to sync queue
const addToSyncQueue = async (operation: SyncOperation): Promise<void> => {
  try {
    // Get current sync queue
    const queueJson = await AsyncStorage.getItem('syncQueue');
    const queue: SyncOperation[] = queueJson ? JSON.parse(queueJson) : [];
    
    // Add the operation to the queue
    queue.push(operation);
    
    // Save the updated queue
    await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
    console.log(`Added operation to sync queue: ${operation.dataType} - ${operation.operation}`);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

// Process the sync queue
const processSyncQueue = async (): Promise<void> => {
  if (!isOnline() || !isFirebaseInitialized() || !isAuthenticated()) {
    console.log('Cannot process sync queue: offline or not authenticated');
    return;
  }
  
  try {
    // Get the current sync queue
    const queueJson = await AsyncStorage.getItem('syncQueue');
    if (!queueJson) return;
    
    const queue: SyncOperation[] = JSON.parse(queueJson);
    if (queue.length === 0) return;
    
    console.log(`Processing sync queue. Items: ${queue.length}`);
    
    // Create a new queue for failed operations
    const failedQueue: SyncOperation[] = [];
    
    // Process each operation in order
    for (const operation of queue) {
      try {
        if (operation.operation === 'delete') {
          // Handle delete operation
          if (db) {
            const userId = currentUser!.uid;
            const docRef = doc(db, `users/${userId}/${operation.dataType}/${operation.dataType}`);
            await deleteDoc(docRef);
          }
        } else {
          // Handle create/update operations
          await syncToCloud(operation.dataType, operation.data);
        }
        console.log(`Successfully processed: ${operation.dataType} - ${operation.operation}`);
      } catch (error) {
        console.error(`Error processing sync operation: ${operation.dataType} - ${operation.operation}`, error);
        
        // Increment retry count and add to failed queue if under retry limit
        operation.retryCount += 1;
        if (operation.retryCount < 5) {
          failedQueue.push(operation);
        } else {
          console.warn(`Dropping sync operation after 5 retries: ${operation.dataType} - ${operation.operation}`);
        }
      }
    }
    
    // Update the queue with failed operations
    await AsyncStorage.setItem('syncQueue', JSON.stringify(failedQueue));
    console.log(`Sync queue processed. Remaining items: ${failedQueue.length}`);
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

// Get the local version
const getLocalVersion = async (dataType: SyncableData): Promise<number> => {
  try {
    const versionJson = await AsyncStorage.getItem(`${dataType}_version`);
    return versionJson ? parseInt(versionJson, 10) : 0;
  } catch (error) {
    console.error(`Error getting local version for ${dataType}:`, error);
    return 0;
  }
};

// Update the local version
const updateLocalVersion = async (dataType: SyncableData, version: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${dataType}_version`, version.toString());
  } catch (error) {
    console.error(`Error updating local version for ${dataType}:`, error);
  }
};

// Get last sync timestamp
const getLastSyncTimestamp = async (dataType: SyncableData): Promise<number> => {
  try {
    const timestampJson = await AsyncStorage.getItem(`${dataType}_lastSync`);
    return timestampJson ? parseInt(timestampJson, 10) : 0;
  } catch (error) {
    console.error(`Error getting last sync timestamp for ${dataType}:`, error);
    return 0;
  }
};

// Update the last sync timestamp
const updateLastSyncTimestamp = async (dataType: SyncableData): Promise<void> => {
  try {
    const now = Date.now();
    await AsyncStorage.setItem(`${dataType}_lastSync`, now.toString());
  } catch (error) {
    console.error(`Error updating last sync timestamp for ${dataType}:`, error);
  }
};

// Sync data to cloud
export const syncToCloud = async (dataType: SyncableData, data: any): Promise<boolean> => {
  try {
    // Always save to local storage first
    await AsyncStorage.setItem(dataType, JSON.stringify(data));
    
    // If we're offline or not authenticated, queue the sync operation
    if (!isOnline() || !isFirebaseInitialized() || !isAuthenticated()) {
      await addToSyncQueue({
        id: `${dataType}_${Date.now()}`,
        dataType,
        data,
        timestamp: Date.now(),
        operation: 'update',
        retryCount: 0
      });
      console.log(`Offline: Added ${dataType} to sync queue`);
      return true;
    }
    
    // If we're online and authenticated, sync to cloud
    if (db) {
      const userId = currentUser!.uid;
      const docRef = doc(db, `users/${userId}/${dataType}/${dataType}`);
      
      await setDoc(docRef, {
        data,
        updatedAt: serverTimestamp(),
        version: (await getLocalVersion(dataType)) + 1
      });
      
      // Update the local version and sync timestamp
      await updateLocalVersion(dataType, (await getLocalVersion(dataType)) + 1);
      await updateLastSyncTimestamp(dataType);
      
      console.log(`Successfully synced ${dataType} to cloud`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error syncing ${dataType} to cloud:`, error);
    
    // If error is due to connection, queue for later
    if (!isOnline()) {
      await addToSyncQueue({
        id: `${dataType}_${Date.now()}`,
        dataType,
        data,
        timestamp: Date.now(),
        operation: 'update',
        retryCount: 0
      });
    }
    
    return false;
  }
};

// Get data from cloud
export const getFromCloud = async (dataType: SyncableData): Promise<any | null> => {
  try {
    if (!isOnline() || !isFirebaseInitialized() || !isAuthenticated() || !db) {
      console.warn(`Cannot get ${dataType} from cloud. Using local data.`);
      const localDataJson = await AsyncStorage.getItem(dataType);
      return localDataJson ? JSON.parse(localDataJson) : null;
    }
    
    const userId = currentUser!.uid;
    const docRef = doc(db, `users/${userId}/${dataType}/${dataType}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const cloudData = docSnap.data().data;
      const cloudVersion = docSnap.data().version || 0;
      const localVersion = await getLocalVersion(dataType);
      
      // If cloud version is newer, update local storage and version
      if (cloudVersion > localVersion) {
        await AsyncStorage.setItem(dataType, JSON.stringify(cloudData));
        await updateLocalVersion(dataType, cloudVersion);
      }
      
      await updateLastSyncTimestamp(dataType);
      console.log(`Successfully retrieved ${dataType} from cloud`);
      return cloudData;
    } else {
      console.log(`No ${dataType} found in cloud`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting ${dataType} from cloud:`, error);
    
    // Fall back to local data
    const localDataJson = await AsyncStorage.getItem(dataType);
    return localDataJson ? JSON.parse(localDataJson) : null;
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
  
  const unsubscribe = onSnapshot(docRef, async (docSnapshot: DocumentSnapshot<DocumentData>) => {
    if (docSnapshot.exists()) {
      const cloudData = docSnapshot.data().data;
      const cloudVersion = docSnapshot.data().version || 0;
      const localVersion = await getLocalVersion(dataType);
      
      // Only update if the cloud version is newer
      if (cloudVersion > localVersion) {
        console.log(`Cloud update received for ${dataType} (version ${cloudVersion})`);
        
        // Update local version
        await updateLocalVersion(dataType, cloudVersion);
        await updateLastSyncTimestamp(dataType);
        
        // Call the callback with the updated data
        onUpdate(cloudData);
        
        // Update local storage
        await AsyncStorage.setItem(dataType, JSON.stringify(cloudData));
      }
    }
  });
  
  return unsubscribe;
};

// Merge local and cloud data with intelligent conflict resolution
export const mergeData = async (dataType: SyncableData): Promise<any> => {
  try {
    // Get local data
    const localDataJson = await AsyncStorage.getItem(dataType);
    const localData = localDataJson ? JSON.parse(localDataJson) : null;
    const lastSyncTimestamp = await getLastSyncTimestamp(dataType);
    
    // If we're offline or not authenticated, use local data
    if (!isOnline() || !isFirebaseInitialized() || !isAuthenticated() || !db) {
      console.log(`Offline/unauthenticated: Using local ${dataType} data`);
      return localData || null;
    }
    
    // Get cloud data
    const cloudData = await getFromCloud(dataType);
    
    if (!localData && cloudData) {
      // If only cloud data exists, use it
      await AsyncStorage.setItem(dataType, JSON.stringify(cloudData));
      await updateLastSyncTimestamp(dataType);
      return cloudData;
    } else if (localData && !cloudData) {
      // If only local data exists, sync it to cloud
      await syncToCloud(dataType, localData);
      return localData;
    } else if (localData && cloudData) {
      // Both exist - need to merge and handle conflicts
      let mergedData;
      
      // This is a simplified merge strategy - in a real app, you'd need more sophisticated
      // conflict resolution based on your data structure
      if (Array.isArray(localData) && Array.isArray(cloudData)) {
        // For arrays (e.g. tasks), merge by ID
        const mergeById = (local: any[], cloud: any[]): any[] => {
          const result = [...cloud];
          const cloudMap = new Map(cloud.map(item => [item.id, item]));
          
          // Add or update items from local that aren't in cloud or are newer
          for (const localItem of local) {
            const cloudItem = cloudMap.get(localItem.id);
            
            if (!cloudItem) {
              // New local item, add it
              result.push(localItem);
            } else {
              // Item exists in both - use the newer one
              const localUpdated = new Date(localItem.updatedAt || 0).getTime();
              const cloudUpdated = new Date(cloudItem.updatedAt || 0).getTime();
              
              if (localUpdated > cloudUpdated && localUpdated > lastSyncTimestamp) {
                // Local is newer and was updated after the last sync, replace cloud item
                const index = result.findIndex(item => item.id === localItem.id);
                if (index !== -1) {
                  result[index] = localItem;
                }
              }
            }
          }
          
          return result;
        };
        
        mergedData = mergeById(localData, cloudData);
      } else if (typeof localData === 'object' && typeof cloudData === 'object') {
        // For objects, use cloud as base and apply local changes
        mergedData = { ...cloudData };
        
        // Apply local changes that happened after last sync
        for (const key in localData) {
          if (Object.prototype.hasOwnProperty.call(localData, key)) {
            const localUpdated = new Date(localData[key]?.updatedAt || 0).getTime();
            if (localUpdated > lastSyncTimestamp) {
              mergedData[key] = localData[key];
            }
          }
        }
      } else {
        // For simple values, use the most recent one
        mergedData = cloudData;
      }
      
      // Save the merged data and sync it
      await AsyncStorage.setItem(dataType, JSON.stringify(mergedData));
      await syncToCloud(dataType, mergedData);
      await updateLastSyncTimestamp(dataType);
      
      return mergedData;
    } else {
      // Neither exists
      return null;
    }
  } catch (error) {
    console.error(`Error merging ${dataType} data:`, error);
    
    // Fall back to local data in case of error
    const localDataJson = await AsyncStorage.getItem(dataType);
    return localDataJson ? JSON.parse(localDataJson) : null;
  }
};

// Force sync all data to cloud
export const forceSyncToCloud = async (): Promise<boolean> => {
  if (!isOnline() || !isFirebaseInitialized() || !isAuthenticated()) {
    console.warn('Cannot force sync: offline or not authenticated');
    return false;
  }
  
  try {
    // Process any pending operations in the sync queue
    await processSyncQueue();
    
    // Sync all data types
    const dataTypes: SyncableData[] = ['tasks', 'projects', 'areas', 'tags', 'theme', 'widgets', 'email', 'calendar', 'notifications'];
    
    for (const dataType of dataTypes) {
      const localDataJson = await AsyncStorage.getItem(dataType);
      if (localDataJson) {
        const localData = JSON.parse(localDataJson);
        await syncToCloud(dataType, localData);
      }
    }
    
    console.log('Force sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error during force sync:', error);
    return false;
  }
};

export default {
  syncToCloud,
  getFromCloud,
  setupCloudSync,
  mergeData,
  initializeAuth,
  setupConnectivityListener,
  forceSyncToCloud,
  processSyncQueue
}; 