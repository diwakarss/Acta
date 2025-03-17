import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A hook for managing data in AsyncStorage with type safety
 * @param key The storage key
 * @param initialValue The initial value if no data exists
 * @returns Storage value, setter, and loading state
 */
export function useStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load the value from storage on mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        const item = await AsyncStorage.getItem(key);
        
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
        setError(null);
      } catch (e) {
        console.error('Error loading from AsyncStorage:', e);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Save the value to storage
  const setValue = async (value: T): Promise<void> => {
    try {
      setLoading(true);
      
      // Update state
      setStoredValue(value);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setError(null);
    } catch (e) {
      console.error('Error saving to AsyncStorage:', e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  return [storedValue, setValue, loading, error];
} 