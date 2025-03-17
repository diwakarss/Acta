// Type definitions for notification system

export type Reminder = {
  id: string;
  taskId: string;
  scheduledTime: string;
  notificationId: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customPattern?: string; // For custom repeat patterns
}; 