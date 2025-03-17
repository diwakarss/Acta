import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Define types for our notification system
export type Reminder = {
  id: string;
  taskId: string;
  scheduledTime: string;
  notificationId: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customPattern?: string; // For custom repeat patterns
};

// Define the store state
interface NotificationState {
  reminders: Reminder[];
  notificationsPermission: boolean;
  
  // Reminder operations
  addReminder: (taskId: string, scheduledTime: string, repeat: Reminder['repeat'], customPattern?: string) => Promise<string>;
  updateReminder: (id: string, updates: Partial<Omit<Reminder, 'id' | 'taskId' | 'notificationId'>>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  deleteTaskReminders: (taskId: string) => Promise<void>;
  
  // Permission operations
  requestPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<boolean>;
  
  // Storage operations
  initializeState: () => Promise<void>;
  persistState: () => Promise<void>;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create the store
const useNotificationStore = create<NotificationState>((set, get) => ({
  reminders: [],
  notificationsPermission: false,
  
  // Reminder operations
  addReminder: async (taskId, scheduledTime, repeat, customPattern) => {
    // Request permissions if not already granted
    const hasPermission = await get().checkPermissions();
    if (!hasPermission) {
      const granted = await get().requestPermissions();
      if (!granted) {
        throw new Error('Notification permission not granted');
      }
    }
    
    // Schedule the notification
    const trigger = new Date(scheduledTime);
    
    let notificationTrigger: any = { date: trigger };
    
    // Handle repeating notifications
    if (repeat !== 'none' && repeat !== 'custom') {
      notificationTrigger = {
        seconds: Math.floor((trigger.getTime() - Date.now()) / 1000),
        repeats: true,
      };
      
      if (repeat === 'daily') {
        notificationTrigger = {
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      } else if (repeat === 'weekly') {
        notificationTrigger = {
          weekday: trigger.getDay() + 1, // 1-7 for Monday-Sunday
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      } else if (repeat === 'monthly') {
        notificationTrigger = {
          day: trigger.getDate(),
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      }
    }
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: 'You have a task due!',
        data: { taskId },
      },
      trigger: notificationTrigger,
    });
    
    // Create the reminder object
    const newReminder: Reminder = {
      id: uuidv4(),
      taskId,
      scheduledTime,
      notificationId,
      repeat,
      customPattern,
    };
    
    // Update state
    set((state) => ({
      reminders: [...state.reminders, newReminder],
    }));
    
    await get().persistState();
    
    return newReminder.id;
  },
  
  updateReminder: async (id, updates) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    
    // Cancel the existing notification
    await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    
    // Schedule a new notification with updated details
    const scheduledTime = updates.scheduledTime || reminder.scheduledTime;
    const repeat = updates.repeat || reminder.repeat;
    const customPattern = updates.customPattern || reminder.customPattern;
    
    const trigger = new Date(scheduledTime);
    
    let notificationTrigger: any = { date: trigger };
    
    // Handle repeating notifications
    if (repeat !== 'none' && repeat !== 'custom') {
      if (repeat === 'daily') {
        notificationTrigger = {
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      } else if (repeat === 'weekly') {
        notificationTrigger = {
          weekday: trigger.getDay() + 1, // 1-7 for Monday-Sunday
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      } else if (repeat === 'monthly') {
        notificationTrigger = {
          day: trigger.getDate(),
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        };
      }
    }
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: 'You have a task due!',
        data: { taskId: reminder.taskId },
      },
      trigger: notificationTrigger,
    });
    
    // Update state
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              notificationId,
            }
          : r
      ),
    }));
    
    await get().persistState();
  },
  
  deleteReminder: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (reminder) {
      // Cancel the notification
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    
    // Update state
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));
    
    await get().persistState();
  },
  
  deleteTaskReminders: async (taskId) => {
    const taskReminders = get().reminders.filter((r) => r.taskId === taskId);
    
    // Cancel all notifications for this task
    for (const reminder of taskReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }
    
    // Update state
    set((state) => ({
      reminders: state.reminders.filter((r) => r.taskId !== taskId),
    }));
    
    await get().persistState();
  },
  
  // Permission operations
  requestPermissions: async () => {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    
    const granted = status === 'granted';
    set({ notificationsPermission: granted });
    return granted;
  },
  
  checkPermissions: async () => {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    set({ notificationsPermission: granted });
    return granted;
  },
  
  // Storage operations
  initializeState: async () => {
    try {
      // Check permissions
      await get().checkPermissions();
      
      // Load stored reminders
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) {
        set({ reminders: JSON.parse(storedReminders) });
      }
    } catch (error) {
      console.error('Error initializing notification store:', error);
    }
  },
  
  persistState: async () => {
    try {
      const { reminders } = get();
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error persisting notification store:', error);
    }
  },
}));

export default useNotificationStore; 