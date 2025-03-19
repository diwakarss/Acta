import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

/**
 * Hook for monitoring network connectivity
 * @returns Network state and utility functions
 */
export function useNetwork() {
  // Network state
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [isFirstCheck, setIsFirstCheck] = useState(true);

  useEffect(() => {
    // Initial network check
    const checkNetworkOnMount = async () => {
      try {
        const state = await NetInfo.fetch();
        updateNetworkState(state);
        setIsFirstCheck(false);
      } catch (error) {
        console.error('Error checking network:', error);
        setIsFirstCheck(false);
      }
    };

    checkNetworkOnMount();

    // Subscribe to network changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(updateNetworkState);

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Update network state based on NetInfo state
   */
  const updateNetworkState = (state: NetInfoState) => {
    setIsConnected(state.isConnected);
    setConnectionType(state.type);
    setIsInternetReachable(state.isInternetReachable);
    setDetails(state.details);
  };

  /**
   * Check current network state
   */
  const checkConnection = async (): Promise<NetInfoState> => {
    const state = await NetInfo.fetch();
    updateNetworkState(state);
    return state;
  };

  /**
   * Get a user-friendly connection status message
   */
  const getConnectionStatusMessage = (): string => {
    if (isFirstCheck) {
      return 'Checking connection...';
    }

    if (isConnected === null) {
      return 'Connection status unknown';
    }

    if (!isConnected) {
      return 'No network connection';
    }

    if (isInternetReachable === false) {
      return 'Connected to network, but no internet access';
    }

    if (connectionType === 'wifi') {
      return 'Connected to WiFi';
    }

    if (connectionType === 'cellular') {
      const cellularGeneration = details?.cellularGeneration;
      if (cellularGeneration) {
        return `Connected to ${cellularGeneration} network`;
      }
      return 'Connected to cellular network';
    }

    return 'Connected';
  };

  /**
   * Check if the device is on a WiFi connection
   */
  const isWifi = (): boolean => {
    return connectionType === 'wifi';
  };

  /**
   * Check if the device is on a metered connection (cellular)
   */
  const isMetered = (): boolean => {
    return connectionType === 'cellular';
  };

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    details,
    isFirstCheck,
    checkConnection,
    getConnectionStatusMessage,
    isWifi,
    isMetered,
  };
} 