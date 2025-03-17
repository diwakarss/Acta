import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

/**
 * Utility functions for Siri shortcuts integration
 */
export const SiriShortcuts = {
  /**
   * Check if Siri shortcuts are available on the device
   * @returns Promise resolving to a boolean indicating availability
   */
  isAvailable: async (): Promise<boolean> => {
    // Siri shortcuts are only available on iOS
    return Platform.OS === 'ios';
  },

  /**
   * Add a shortcut for creating a new task
   * @param projectName Optional project name to include in the shortcut
   * @returns Promise resolving to a boolean indicating success
   */
  addCreateTaskShortcut: async (projectName?: string): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      console.warn('Siri shortcuts are only available on iOS');
      return false;
    }

    try {
      // This is a placeholder for the actual implementation
      // In a real app, you would use the Siri Shortcuts API
      console.log(`Adding shortcut for creating task${projectName ? ` in ${projectName}` : ''}`);
      return true;
    } catch (error) {
      console.error('Error adding Siri shortcut:', error);
      return false;
    }
  },

  /**
   * Add a shortcut for viewing today's tasks
   * @returns Promise resolving to a boolean indicating success
   */
  addViewTodayTasksShortcut: async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      console.warn('Siri shortcuts are only available on iOS');
      return false;
    }

    try {
      // This is a placeholder for the actual implementation
      console.log('Adding shortcut for viewing today\'s tasks');
      return true;
    } catch (error) {
      console.error('Error adding Siri shortcut:', error);
      return false;
    }
  },

  /**
   * Open the Siri shortcuts settings
   * @returns Promise resolving to a boolean indicating success
   */
  openSiriSettings: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, we would use the Shortcuts app URL scheme
        // This is a placeholder for the actual implementation
        console.log('Opening Siri settings on iOS');
        return true;
      } else if (Platform.OS === 'android') {
        // On Android, we can use the Assistant settings
        await IntentLauncher.startActivityAsync(
          'android.settings.VOICE_INPUT_SETTINGS'
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error opening Siri/Assistant settings:', error);
      return false;
    }
  },

  /**
   * Handle a shortcut invocation
   * @param shortcutName The name of the shortcut that was invoked
   * @param parameters Additional parameters passed with the shortcut
   * @returns Promise resolving to a boolean indicating success
   */
  handleShortcutInvocation: async (
    shortcutName: string,
    parameters: Record<string, any> = {}
  ): Promise<boolean> => {
    try {
      console.log(`Handling shortcut: ${shortcutName}`, parameters);
      
      // Handle different types of shortcuts
      switch (shortcutName) {
        case 'createTask':
          // Logic to create a task
          console.log('Creating task with parameters:', parameters);
          return true;
          
        case 'viewTodayTasks':
          // Logic to navigate to today's tasks
          console.log('Navigating to today\'s tasks');
          return true;
          
        default:
          console.warn(`Unknown shortcut: ${shortcutName}`);
          return false;
      }
    } catch (error) {
      console.error('Error handling shortcut invocation:', error);
      return false;
    }
  },
}; 