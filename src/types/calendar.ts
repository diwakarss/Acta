// Type definitions for calendar system

export type CalendarEvent = {
  id: string;
  taskId: string;
  calendarId: string;
  eventId: string;
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  notes: string;
};

export type CalendarAccount = {
  id: string;
  name: string;
  type: 'google' | 'apple' | 'other';
  isEnabled: boolean;
}; 