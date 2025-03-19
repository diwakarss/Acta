import { useState, useEffect, useMemo, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import useTaskStore from '@/src/store/taskStore';
import { formatDistanceToNow } from 'date-fns';
import { Platform } from 'react-native';

type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

interface UseSyncStatusResult {
  status: SyncStatus;
  lastSynced: string | null;
  isOnline: boolean;
  forceSync: () => Promise<void>;
}

// Get a more specific type from the taskStore to use for our selectors
type TaskState = ReturnType<typeof useTaskStore.getState>;

// Create stable selectors to avoid infinite loops with getSnapshot
const getIsSyncing = (state: TaskState) => state.isSyncing;
const getLastSyncTime = (state: TaskState) => state.lastSyncTime;
const getForceSync = (state: TaskState) => state.forceSync;

const useSyncStatus = (): UseSyncStatusResult => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [formattedLastSynced, setFormattedLastSynced] = useState<string | null>(null);
  
  // Use the stable primitive selectors instead of object selectors
  const isSyncing = useTaskStore(getIsSyncing);
  const lastSyncTime = useTaskStore(getLastSyncTime);
  const storeForceSync = useTaskStore(getForceSync);
  
  // Memoize the forceSync function with timeout handling
  const forceSync = useCallback(async () => {
    // Add timeout protection for web
    if (Platform.OS === 'web') {
      try {
        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Sync timed out')), 5000);
        });
        
        // Race the actual sync against the timeout
        await Promise.race([
          storeForceSync(),
          timeoutPromise
        ]);
      } catch (error) {
        console.error('Force sync error or timeout:', error);
      }
    } else {
      // For native, proceed without timeout
      await storeForceSync();
    }
  }, [storeForceSync]);
  
  // Compute the status with useMemo
  const status = useMemo((): SyncStatus => {
    if (isSyncing) return 'syncing';
    if (!isOnline) return 'offline';
    return 'online';
  }, [isSyncing, isOnline]);
  
  // Monitor network status - simplified for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, use the simpler browser API
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      // Set initial state
      setIsOnline(window.navigator.onLine);
      
      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // For native, use NetInfo
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(!!state.isConnected);
      });
      
      return () => unsubscribe();
    }
  }, []);
  
  // Format the last sync time - only when lastSyncTime changes
  useEffect(() => {
    if (!lastSyncTime) {
      setFormattedLastSynced(null);
      return;
    }
    
    // Update immediately
    try {
      const formatted = formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true });
      setFormattedLastSynced(formatted);
      
      // Update every minute as long as the component is mounted
      const interval = setInterval(() => {
        try {
          const updated = formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true });
          setFormattedLastSynced(updated);
        } catch (error) {
          console.error('Error formatting time:', error);
        }
      }, 60000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error in initial time formatting:', error);
      setFormattedLastSynced('Unknown');
      return undefined;
    }
  }, [lastSyncTime]);
  
  // Create a stable result object using useMemo
  const result = useMemo((): UseSyncStatusResult => ({
    status,
    lastSynced: formattedLastSynced,
    isOnline,
    forceSync
  }), [status, formattedLastSynced, isOnline, forceSync]);
  
  return result;
};

export default useSyncStatus; 