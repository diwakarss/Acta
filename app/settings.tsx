import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, Linking } from 'react-native';
import { Text, List, Switch, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme as useAppTheme, ThemeMode } from '../src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/components/AuthProvider';

export default function SettingsScreen() {
  const theme = useTheme();
  const { 
    themeSettings, 
    setThemeMode, 
    setAccentColor, 
    toggleTrueBlack 
  } = useAppTheme();
  const { user } = useAuth();
  
  // Navigate to theme settings
  const handleThemePress = () => {
    router.push({pathname: '/settings/theme'});
  };
  
  // Navigate to notification settings
  const handleNotificationsPress = () => {
    router.push({pathname: '/settings/notifications'});
  };
  
  // Navigate to widget settings
  const handleWidgetsPress = () => {
    router.push({pathname: '/settings/widgets'});
  };
  
  // Navigate to calendar settings
  const handleCalendarPress = () => {
    router.push({pathname: '/settings/calendar'});
  };
  
  // Navigate to email settings
  const handleEmailPress = () => {
    router.push({pathname: '/settings/email'});
  };
  
  // Navigate to shortcuts settings
  const handleShortcutsPress = () => {
    router.push({pathname: '/settings/shortcuts'});
  };
  
  // Navigate to about screen
  const handleAboutPress = () => {
    router.push({pathname: '/settings/about'});
  };
  
  const handleAccountPress = () => {
    router.push({pathname: '/settings/account'});
  };
  
  const handlePrivacyPress = () => {
    // Open privacy policy website
    Linking.openURL('https://www.example.com/privacy');
  };
  
  const handleHelpPress = () => {
    // Open help website
    Linking.openURL('https://www.example.com/help');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Settings
          </Text>
          
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            
            <List.Item
              title="Account Settings"
              description={user?.email || "Manage your account"}
              left={props => <List.Icon {...props} icon="account" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleAccountPress}
            />
            
            <Divider />
          </List.Section>
          
          <List.Section>
            <List.Subheader>Appearance</List.Subheader>
            
            <List.Item
              title="Theme Settings"
              description="Dark mode, colors, and fonts"
              left={props => <List.Icon {...props} icon="palette" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleThemePress}
            />
            
            <Divider />
          </List.Section>
          
          <List.Section>
            <List.Subheader>Notifications</List.Subheader>
            
            <List.Item
              title="Notification Settings"
              description="Configure how you receive notifications"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleNotificationsPress}
            />
            
            <Divider />
          </List.Section>
          
          <List.Section>
            <List.Subheader>Integrations</List.Subheader>
            
            <List.Item
              title="Email Settings"
              description="Configure email-to-task conversion"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleEmailPress}
            />
            
            <Divider />
            
            <List.Item
              title="Calendar Settings"
              description="Sync with Google and Apple Calendar"
              left={props => <List.Icon {...props} icon="calendar" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleCalendarPress}
            />
            
            <Divider />
            
            {Platform.OS === 'ios' && (
              <>
                <List.Item
                  title="Siri Shortcuts"
                  description="Set up voice commands for quick actions"
                  left={props => <List.Icon {...props} icon="microphone" />}
                  right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
                  onPress={handleShortcutsPress}
                />
                
                <Divider />
              </>
            )}
          </List.Section>
          
          <List.Section>
            <List.Subheader>About</List.Subheader>
            
            <List.Item
              title="About Acta"
              description="Version 1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleAboutPress}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="View our privacy policy"
              left={props => <List.Icon {...props} icon="shield" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handlePrivacyPress}
            />
            
            <Divider />
            
            <List.Item
              title="Help & Support"
              description="Get help using Acta"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurface} />}
              onPress={handleHelpPress}
            />
          </List.Section>
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