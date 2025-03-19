import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useStorage } from './useStorage';

// Notification permission status
export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

// Notification settings interface
export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  dailySummary: boolean;
  weeklyReview: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // Format: "HH:MM"
  quietHoursEnd: string; // Format: "HH:MM"
}

// Default notification settings
const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  taskReminders: true,
  dailySummary: true,
  weeklyReview: true,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

/**
 * Hook for managing notification permissions and settings
 * @returns Notification functions and settings
 */
export function useNotifications() {
  // Load notification settings from storage
  const [settings, setSettings, loading] = useStorage<NotificationSettings>(
    'notification-settings',
    defaultNotificationSettings
  );

  // Track permission status
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('undetermined');
  
  // Track notification response for handling when app is foregrounded
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  // Initialize notifications
  useEffect(() => {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: settings.enabled,
        shouldPlaySound: settings.enabled && settings.soundEnabled,
        shouldSetBadge: settings.enabled,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });

    // Check permission status on mount
    checkPermissions();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        // Handle received notification
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        // Handle notification response (e.g., when user taps notification)
        console.log('Notification response:', response);
      }
    );

    // Clean up listeners on unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [settings]);

  /**
   * Check notification permissions
   */
  const checkPermissions = async (): Promise<NotificationPermission> => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status as NotificationPermission);
    return status as NotificationPermission;
  };

  /**
   * Request notification permissions
   */
  const requestPermissions = async (): Promise<NotificationPermission> => {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    
    setPermissionStatus(status as NotificationPermission);
    return status as NotificationPermission;
  };

  /**
   * Update notification settings
   */
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    await setSettings(updatedSettings);
  };

  /**
   * Toggle main notification setting
   */
  const toggleNotifications = async () => {
    await updateSettings({ enabled: !settings.enabled });
  };

  /**
   * Schedule a task reminder notification
   */
  const scheduleTaskReminder = async (
    taskId: string,
    title: string,
    body: string,
    date: Date
  ): Promise<string> => {
    // Don't schedule if notifications are disabled
    if (!settings.enabled || !settings.taskReminders) {
      return '';
    }

    // Check if we're in quiet hours
    if (settings.quietHoursEnabled && isInQuietHours(date)) {
      return '';
    }

    // Schedule the notification
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { taskId },
        sound: settings.soundEnabled,
        vibrate: settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
      },
      trigger: {
        date,
        channelId: 'task-reminders',
      },
    });
  };

  /**
   * Schedule a daily summary notification
   */
  const scheduleDailySummary = async (
    title: string,
    body: string,
    date: Date
  ): Promise<string> => {
    // Don't schedule if notifications are disabled
    if (!settings.enabled || !settings.dailySummary) {
      return '';
    }

    // Schedule the notification
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'daily-summary' },
        sound: settings.soundEnabled,
        vibrate: settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
      },
      trigger: {
        date,
        channelId: 'summaries',
      },
    });
  };

  /**
   * Cancel a scheduled notification
   */
  const cancelNotification = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  /**
   * Check if a time is within quiet hours
   */
  const isInQuietHours = (date: Date): boolean => {
    if (!settings.quietHoursEnabled) {
      return false;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeValue = hours * 60 + minutes;

    const [startHours, startMinutes] = settings.quietHoursStart.split(':').map(Number);
    const [endHours, endMinutes] = settings.quietHoursEnd.split(':').map(Number);

    const startValue = startHours * 60 + startMinutes;
    const endValue = endHours * 60 + endMinutes;

    // Handle case where quiet hours span midnight
    if (startValue > endValue) {
      return timeValue >= startValue || timeValue <= endValue;
    } else {
      return timeValue >= startValue && timeValue <= endValue;
    }
  };

  return {
    settings,
    loading,
    permissionStatus,
    checkPermissions,
    requestPermissions,
    updateSettings,
    toggleNotifications,
    scheduleTaskReminder,
    scheduleDailySummary,
    cancelNotification,
    cancelAllNotifications,
    isInQuietHours,
  };
} 