import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { Text, useTheme, List, Switch, Divider, Button, Dialog, Portal, Modal, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import useThemeStore from '../../src/store/themeStore';
import useTaskStore from '../../src/store/taskStore';
import useNotificationStore from '../../src/store/notificationStore';
import SyncStatusIndicator from '../../src/components/SyncStatusIndicator';
import useSyncStatus from '../../src/hooks/useSyncStatus';
import { useAuth } from '@/src/components/AuthProvider';

// Separate dialog component for web to avoid Portal issues
interface ResetDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onReset: () => Promise<void>;
}

// Web-specific dialog implementation that doesn't use Portal
const WebResetDialog: React.FC<ResetDialogProps> = ({ visible, onDismiss, onReset }) => {
  const theme = useTheme();
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <Surface style={{
        width: 300,
        borderRadius: 8,
        padding: 16,
        backgroundColor: theme.colors.surface,
      }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Reset App Data</Text>
        <Text style={{ marginBottom: 24 }}>
          This will permanently delete all your tasks, projects, areas, and settings.
          This action cannot be undone.
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button onPress={onDismiss} style={{ marginRight: 8 }}>Cancel</Button>
          <Button onPress={onReset} textColor={theme.colors.error}>Reset</Button>
        </View>
      </Surface>
    </div>
  );
};

// Native-specific dialog using React Native Paper's Dialog
const NativeResetDialog: React.FC<ResetDialogProps> = ({ visible, onDismiss, onReset }) => {
  const theme = useTheme();
  
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
      >
        <Dialog.Title>Reset App Data</Dialog.Title>
        <Dialog.Content>
          <Text>
            This will permanently delete all your tasks, projects, areas, and settings.
            This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={onReset} textColor={theme.colors.error}>Reset</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

// Choose the appropriate dialog based on platform
const ResetDialog = Platform.OS === 'web' ? WebResetDialog : NativeResetDialog;

// Memoize the reset dialog to prevent unnecessary re-renders
const MemoizedResetDialog = React.memo(ResetDialog);

// Memoize SyncStatusIndicator to prevent unnecessary re-renders
const MemoizedSyncIndicator = React.memo(SyncStatusIndicator);

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, useSystemTheme, setUseSystemTheme } = useThemeStore();
  const checkNotificationPermissions = useNotificationStore(state => state.checkPermissions);
  const requestNotificationPermissions = useNotificationStore(state => state.requestPermissions);
  
  // Get sync status but don't use it directly in JSX - use memoized values instead
  const { status, lastSynced, isOnline, forceSync } = useSyncStatus();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);
  
  // Add auth context
  const { user, signOut } = useAuth();
  
  // Memoize derived values to prevent unnecessary rerenders 
  const syncDescription = useMemo(() => 
    isOnline ? "You are currently online" : "You are currently offline", 
  [isOnline]);
  
  const syncIcon = useMemo(() => 
    isOnline ? "wifi" : "wifi-off", 
  [isOnline]);
  
  // Memoize handlers
  const handleManualSync = useCallback(async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'You are currently offline. Please connect to the internet to sync your data.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      await forceSync();
      Alert.alert('Success', 'Data synchronized successfully.');
    } catch (error) {
      console.error('Error syncing data:', error);
      Alert.alert('Sync Error', 'Failed to synchronize data. Please try again later.');
    }
  }, [isOnline, forceSync]);
  
  // Check notification permissions
  React.useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkNotificationPermissions();
      setNotificationsEnabled(hasPermission);
    };
    
    checkPermissions();
  }, []);
  
  // Handle theme toggle
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);
  
  // Handle system theme toggle
  const handleSystemThemeToggle = useCallback((value: boolean) => {
    setUseSystemTheme(value);
  }, [setUseSystemTheme]);
  
  // Handle notifications toggle
  const handleNotificationsToggle = useCallback(async () => {
    if (notificationsEnabled) {
      // Can't revoke permissions programmatically, so just show instructions
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device settings and disable notifications for this app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      // Request permissions
      const granted = await requestNotificationPermissions();
      setNotificationsEnabled(granted);
      
      if (!granted) {
        Alert.alert(
          'Notification Permission',
          'Notifications are required for reminders to work. Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    }
  }, [notificationsEnabled, requestNotificationPermissions]);
  
  // Handle dialog visibility
  const showResetDialog = useCallback(() => {
    setIsResetDialogVisible(true);
  }, []);
  
  const hideResetDialog = useCallback(() => {
    setIsResetDialogVisible(false);
  }, []);
  
  // Handle reset app data
  const handleResetAppData = useCallback(async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Hide dialog first to avoid state updates during render
      setIsResetDialogVisible(false);
      
      // Show alert after dialog is closed
      setTimeout(() => {
        Alert.alert(
          'Data Reset',
          'All app data has been reset. Please restart the app for changes to take effect.',
          [{ text: 'OK' }]
        );
      }, 100);
      
    } catch (error) {
      console.error('Error resetting app data:', error);
      
      // Hide dialog first
      setIsResetDialogVisible(false);
      
      // Show error after dialog is closed
      setTimeout(() => {
        Alert.alert('Error', 'Failed to reset app data. Please try again.');
      }, 100);
    }
  }, []);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Navigate to login screen
  const goToLogin = () => {
    router.push('/auth/login');
  };
  
  // Memoize the main content to prevent unnecessary re-renders
  const mainContent = useMemo(() => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <Text style={[styles.header, { color: theme.colors.onBackground }]}>Settings</Text>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Appearance
          </Text>
          
          <List.Item
            title="Use System Theme"
            description="Follow your device's theme settings"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={props => (
              <Switch
                value={useSystemTheme}
                onValueChange={handleSystemThemeToggle}
                color={theme.colors.primary}
              />
            )}
          />
          
          {!useSystemTheme && (
            <List.Item
              title="Dark Mode"
              description="Use dark theme"
              left={props => <List.Icon {...props} icon={isDarkMode ? 'weather-night' : 'white-balance-sunny'} />}
              right={props => (
                <Switch
                  value={isDarkMode}
                  onValueChange={handleThemeToggle}
                  color={theme.colors.primary}
                />
              )}
            />
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Notifications
          </Text>
          
          <List.Item
            title="Enable Notifications"
            description="Receive reminders for your tasks"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                color={theme.colors.primary}
              />
            )}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Sync Status Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Data Synchronization
          </Text>
          
          <View style={styles.syncStatusContainer}>
            <MemoizedSyncIndicator showLastSynced={true} />
          </View>
          
          <List.Item
            title="Manual Sync"
            description="Sync your data with the cloud"
            left={props => <List.Icon {...props} icon="cloud-sync" />}
            onPress={handleManualSync}
            disabled={status === 'syncing' || !isOnline}
          />
          
          <List.Item
            title="Offline Mode"
            description={syncDescription}
            left={props => <List.Icon {...props} icon={syncIcon} />}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Account
          </Text>
          
          {user ? (
            <>
              <List.Item
                title="Signed In"
                description={user.email || 'No email available'}
                left={props => <List.Icon {...props} icon="account" />}
              />
              
              <List.Item
                title="Account Details"
                description="View and manage your account"
                left={props => <List.Icon {...props} icon="account-details" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push('/settings/account')}
              />
              
              <List.Item
                title="Sign Out"
                description="Log out of your account"
                left={props => <List.Icon {...props} icon="logout" />}
                onPress={handleSignOut}
              />
            </>
          ) : (
            <List.Item
              title="Sign In"
              description="Log in or create an account"
              left={props => <List.Icon {...props} icon="login" />}
              onPress={goToLogin}
            />
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Integrations Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Integrations
          </Text>
          
          <List.Item
            title="Email Settings"
            description="Configure email-to-task conversion"
            left={props => <List.Icon {...props} icon="email" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/settings/email')}
          />
          
          <List.Item
            title="Calendar Integration"
            description="Sync tasks with your calendar"
            left={props => <List.Icon {...props} icon="calendar" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to calendar settings
              Alert.alert('Coming Soon', 'Calendar settings will be available in a future update.');
            }}
          />
          
          <List.Item
            title="Widgets"
            description="Manage home screen widgets"
            left={props => <List.Icon {...props} icon="widgets" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/widgets')}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Data Management
          </Text>
          
          <List.Item
            title="Reset App Data"
            description="Delete all tasks, projects, and settings"
            left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
            onPress={showResetDialog}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            About
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield" />}
            onPress={() => {
              // TODO: Open privacy policy
            }}
          />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => {
              // TODO: Open terms of service
            }}
          />
        </View>
      </View>
    </ScrollView>
  ), [
    theme, 
    handleManualSync, 
    handleNotificationsToggle, 
    handleSystemThemeToggle, 
    handleThemeToggle,
    handleSignOut,
    showResetDialog,
    isDarkMode,
    useSystemTheme,
    notificationsEnabled,
    status,
    isOnline,
    syncDescription,
    syncIcon,
    user
  ]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {mainContent}
      
      {/* Use the platform-specific dialog */}
      <MemoizedResetDialog 
        visible={isResetDialogVisible}
        onDismiss={hideResetDialog}
        onReset={handleResetAppData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  syncStatusContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
  }
}); 