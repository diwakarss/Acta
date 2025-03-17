import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, useTheme, List, Switch, Divider, Button, Dialog, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import useThemeStore from '../../src/store/themeStore';
import useTaskStore from '../../src/store/taskStore';
import useNotificationStore from '../../src/store/notificationStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme, useSystemTheme, setUseSystemTheme } = useThemeStore();
  const checkNotificationPermissions = useNotificationStore(state => state.checkPermissions);
  const requestNotificationPermissions = useNotificationStore(state => state.requestPermissions);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isResetDialogVisible, setIsResetDialogVisible] = useState(false);
  
  // Check notification permissions
  React.useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkNotificationPermissions();
      setNotificationsEnabled(hasPermission);
    };
    
    checkPermissions();
  }, []);
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  // Handle system theme toggle
  const handleSystemThemeToggle = (value: boolean) => {
    setUseSystemTheme(value);
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = async () => {
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
  };
  
  // Handle reset app data
  const handleResetAppData = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      
      // Reload the app
      Alert.alert(
        'Data Reset',
        'All app data has been reset. Please restart the app for changes to take effect.',
        [{ text: 'OK' }]
      );
      
      setIsResetDialogVisible(false);
    } catch (error) {
      console.error('Error resetting app data:', error);
      Alert.alert('Error', 'Failed to reset app data. Please try again.');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              onPress={() => setIsResetDialogVisible(true)}
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
      
      {/* Reset App Data Dialog */}
      <Portal>
        <Dialog
          visible={isResetDialogVisible}
          onDismiss={() => setIsResetDialogVisible(false)}
        >
          <Dialog.Title>Reset App Data</Dialog.Title>
          <Dialog.Content>
            <Text>
              This will permanently delete all your tasks, projects, areas, and settings.
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsResetDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleResetAppData} textColor={theme.colors.error}>Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
}); 