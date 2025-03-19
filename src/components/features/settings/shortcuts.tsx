import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform } from 'react-native';
import { Text, List, Switch, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SiriShortcuts } from '@/src/utils/platform/SiriShortcuts';
import useTaskStore from '@/src/store/taskStore';

export default function ShortcutsScreen() {
  const theme = useTheme();
  const [isAvailable, setIsAvailable] = useState(false);
  const projects = useTaskStore((state: { projects: any[] }) => state.projects);
  
  // Check if Siri shortcuts are available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await SiriShortcuts.isAvailable();
      setIsAvailable(available);
    };
    
    checkAvailability();
  }, []);
  
  // Handle adding a shortcut for creating a task
  const handleAddCreateTaskShortcut = async (projectName?: string) => {
    try {
      const success = await SiriShortcuts.addCreateTaskShortcut(projectName);
      
      if (success) {
        Alert.alert(
          'Shortcut Added',
          `You can now say "Hey Siri, add a task${projectName ? ` to ${projectName}` : ''}" to create a new task.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to add shortcut. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error adding shortcut:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle adding a shortcut for viewing today's tasks
  const handleAddViewTodayTasksShortcut = async () => {
    try {
      const success = await SiriShortcuts.addViewTodayTasksShortcut();
      
      if (success) {
        Alert.alert(
          'Shortcut Added',
          'You can now say "Hey Siri, show my tasks for today" to view your tasks for today.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to add shortcut. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error adding shortcut:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle opening Siri settings
  const handleOpenSiriSettings = async () => {
    try {
      await SiriShortcuts.openSiriSettings();
    } catch (error) {
      console.error('Error opening Siri settings:', error);
      Alert.alert(
        'Error',
        'Failed to open Siri settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // If shortcuts are not available, show a message
  if (!isAvailable) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Siri Shortcuts
          </Text>
          <Text style={[styles.message, { color: theme.colors.onBackground }]}>
            {Platform.OS === 'ios' 
              ? 'Siri Shortcuts are not available on this device. Please make sure you are running iOS 12 or later.'
              : 'Siri Shortcuts are only available on iOS devices.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Siri Shortcuts
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Add shortcuts to Siri to quickly create tasks or view your tasks using voice commands.
          </Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Task Creation
            </Text>
            <List.Item
              title="Add a task"
              description="Create a new task using Siri"
              left={props => <List.Icon {...props} icon="plus-circle-outline" />}
              right={props => (
                <Button 
                  mode="outlined" 
                  onPress={() => handleAddCreateTaskShortcut()}
                  style={styles.addButton}
                >
                  Add
                </Button>
              )}
            />
            
            <Divider style={styles.divider} />
            
            <Text style={[styles.subsectionTitle, { color: theme.colors.onBackground }]}>
              Project-specific shortcuts
            </Text>
            
            {projects.length > 0 ? (
              projects.map(project => (
                <List.Item
                  key={project.id}
                  title={`Add to ${project.name}`}
                  description={`Create a task in ${project.name}`}
                  left={props => <List.Icon {...props} icon="folder-outline" />}
                  right={props => (
                    <Button 
                      mode="outlined" 
                      onPress={() => handleAddCreateTaskShortcut(project.name)}
                      style={styles.addButton}
                    >
                      Add
                    </Button>
                  )}
                />
              ))
            ) : (
              <Text style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
                No projects available. Create a project to add project-specific shortcuts.
              </Text>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Task Viewing
            </Text>
            <List.Item
              title="Today's tasks"
              description="View tasks due today using Siri"
              left={props => <List.Icon {...props} icon="calendar-today" />}
              right={props => (
                <Button 
                  mode="outlined" 
                  onPress={handleAddViewTodayTasksShortcut}
                  style={styles.addButton}
                >
                  Add
                </Button>
              )}
            />
          </View>
          
          <View style={styles.section}>
            <Button 
              mode="contained" 
              onPress={handleOpenSiriSettings}
              style={styles.settingsButton}
            >
              Open Siri Settings
            </Button>
            <Text style={[styles.settingsDescription, { color: theme.colors.onSurfaceVariant }]}>
              Manage your Siri Shortcuts in the system settings.
            </Text>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  addButton: {
    marginVertical: 4,
  },
  settingsButton: {
    marginBottom: 8,
  },
  settingsDescription: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  message: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
  },
}); 