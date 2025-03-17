import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { Text, List, Switch, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme as useAppTheme, ThemeMode } from '../src/hooks';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { 
    themeSettings, 
    setThemeMode, 
    setAccentColor, 
    toggleTrueBlack 
  } = useAppTheme();
  
  // Navigate to theme settings
  const handleThemePress = () => {
    router.push('/settings/theme');
  };
  
  // Navigate to notification settings
  const handleNotificationsPress = () => {
    router.push('/settings/notifications');
  };
  
  // Navigate to widget settings
  const handleWidgetsPress = () => {
    router.push('/settings/widgets');
  };
  
  // Navigate to calendar settings
  const handleCalendarPress = () => {
    router.push('/settings/calendar');
  };
  
  // Navigate to email settings
  const handleEmailPress = () => {
    router.push('/settings/email');
  };
  
  // Navigate to shortcuts settings
  const handleShortcutsPress = () => {
    router.push('/settings/shortcuts');
  };
  
  // Navigate to about screen
  const handleAboutPress = () => {
    router.push('/settings/about');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Settings
          </Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Appearance
            </Text>
            <List.Item
              title="Theme"
              description={`${themeSettings.mode === 'system' ? 'System' : themeSettings.mode === 'dark' ? 'Dark' : 'Light'} mode`}
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              onPress={handleThemePress}
            />
          </View>
          
          <Divider />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Notifications
            </Text>
            <List.Item
              title="Notifications"
              description="Configure reminders and alerts"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              onPress={handleNotificationsPress}
            />
          </View>
          
          <Divider />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Integrations
            </Text>
            <List.Item
              title="Widgets"
              description="Manage home screen widgets"
              left={props => <List.Icon {...props} icon="widgets-outline" />}
              onPress={handleWidgetsPress}
            />
            <List.Item
              title="Calendar"
              description="Sync with external calendars"
              left={props => <List.Icon {...props} icon="calendar-sync-outline" />}
              onPress={handleCalendarPress}
            />
            <List.Item
              title="Email"
              description="Configure email-to-task settings"
              left={props => <List.Icon {...props} icon="email-outline" />}
              onPress={handleEmailPress}
            />
            {Platform.OS === 'ios' && (
              <List.Item
                title="Siri Shortcuts"
                description="Add voice commands for common actions"
                left={props => <List.Icon {...props} icon="microphone" />}
                onPress={handleShortcutsPress}
              />
            )}
          </View>
          
          <Divider />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              About
            </Text>
            <List.Item
              title="About Acta"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information-outline" />}
              onPress={handleAboutPress}
            />
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 