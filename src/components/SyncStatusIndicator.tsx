import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useSyncStatus from '../hooks/useSyncStatus';

// Explicitly type the valid icon names
type IconName = 'cloud-check' | 'cloud-off-outline' | 'cloud-sync' | 'cloud-alert' | 'cloud-question';

interface SyncStatusIndicatorProps {
  showLastSynced?: boolean;
  compact?: boolean;
}

// Simplified static component for web - no hooks or state management
const WebSyncIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showLastSynced = true,
  compact = false
}) => {
  const theme = useTheme();
  
  // Extremely simplified static indicator for web to avoid state management
  if (compact) {
    return (
      <View>
        <MaterialCommunityIcons 
          name="cloud-check" 
          size={18} 
          color={theme.colors.primary}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons 
          name="cloud-check" 
          size={18} 
          color={theme.colors.primary} 
          style={styles.icon} 
        />
        <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
          Synced
        </Text>
      </View>
      
      {showLastSynced && (
        <Text variant="labelSmall" style={styles.lastSyncedText}>
          Tap to sync manually
        </Text>
      )}
    </View>
  );
};

// Native implementation with full functionality
const NativeSyncIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showLastSynced = true,
  compact = false
}) => {
  const { status, lastSynced, forceSync } = useSyncStatus();
  const theme = useTheme();
  
  // Define icons and colors based on status using useMemo to prevent recalculation
  const statusDetails = useMemo(() => {
    switch (status) {
      case 'online':
        return {
          icon: 'cloud-check' as IconName,
          color: theme.colors.primary,
          label: 'Synced'
        };
      case 'offline':
        return {
          icon: 'cloud-off-outline' as IconName,
          color: theme.colors.error,
          label: 'Offline'
        };
      case 'syncing':
        return {
          icon: 'cloud-sync' as IconName,
          color: theme.colors.secondary,
          label: 'Syncing...'
        };
      case 'error':
        return {
          icon: 'cloud-alert' as IconName,
          color: theme.colors.error,
          label: 'Sync Error'
        };
      default:
        return {
          icon: 'cloud-question' as IconName,
          color: theme.colors.onSurface,
          label: 'Unknown'
        };
    }
  }, [status, theme.colors]);
  
  // Handle manual sync
  const handleSync = () => {
    if (status !== 'syncing') {
      forceSync();
    }
  };
  
  // Use memoized components to prevent re-renders
  const CompactIndicator = useMemo(() => (
    <TouchableOpacity onPress={handleSync} disabled={status === 'syncing'}>
      <MaterialCommunityIcons name={statusDetails.icon} size={18} color={statusDetails.color} />
    </TouchableOpacity>
  ), [handleSync, status, statusDetails]);
  
  const FullIndicator = useMemo(() => (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleSync}
      disabled={status === 'syncing'}
    >
      <View style={styles.statusContainer}>
        <MaterialCommunityIcons 
          name={statusDetails.icon} 
          size={18} 
          color={statusDetails.color} 
          style={styles.icon} 
        />
        <Text variant="labelMedium" style={{ color: statusDetails.color }}>
          {statusDetails.label}
        </Text>
      </View>
      
      {showLastSynced && lastSynced && (
        <Text variant="labelSmall" style={styles.lastSyncedText}>
          Last updated {lastSynced}
        </Text>
      )}
    </TouchableOpacity>
  ), [handleSync, lastSynced, showLastSynced, status, statusDetails]);
  
  return compact ? CompactIndicator : FullIndicator;
};

// Choose the appropriate implementation based on platform
const SyncStatusIndicator = Platform.OS === 'web' ? WebSyncIndicator : NativeSyncIndicator;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  lastSyncedText: {
    marginTop: 2,
    opacity: 0.7,
  }
});

// Use React.memo to prevent unnecessary re-renders
export default React.memo(SyncStatusIndicator); 