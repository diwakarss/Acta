import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { Task } from './taskStore';

// Define types for our calendar system
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

// Define the store state
interface CalendarState {
  events: CalendarEvent[];
  calendars: Calendar.Calendar[];
  selectedCalendarId: string | null;
  isCalendarSyncEnabled: boolean;
  
  // Calendar operations
  getCalendars: () => Promise<Calendar.Calendar[]>;
  requestCalendarPermissions: () => Promise<boolean>;
  setSelectedCalendar: (calendarId: string) => void;
  toggleCalendarSync: () => void;
  
  // Event operations
  createEventFromTask: (task: Task) => Promise<string | null>;
  updateEventFromTask: (task: Task) => Promise<boolean>;
  deleteEventForTask: (taskId: string) => Promise<boolean>;
  
  // Storage operations
  initializeState: () => Promise<void>;
  persistState: () => Promise<void>;
}

// Create the store
const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  calendars: [],
  selectedCalendarId: null,
  isCalendarSyncEnabled: false,
  
  // Calendar operations
  getCalendars: async () => {
    try {
      const hasPermission = await get().requestCalendarPermissions();
      if (!hasPermission) {
        return [];
      }
      
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      set({ calendars });
      
      // If no calendar is selected, select the default one
      if (!get().selectedCalendarId && calendars.length > 0) {
        // Try to find the default calendar
        const defaultCalendar = calendars.find((cal: Calendar.Calendar) => cal.isPrimary) || calendars[0];
        set({ selectedCalendarId: defaultCalendar.id });
      }
      
      return calendars;
    } catch (error) {
      console.error('Error getting calendars:', error);
      return [];
    }
  },
  
  requestCalendarPermissions: async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  },
  
  setSelectedCalendar: (calendarId) => {
    set({ selectedCalendarId: calendarId });
    get().persistState();
  },
  
  toggleCalendarSync: () => {
    set(state => ({ isCalendarSyncEnabled: !state.isCalendarSyncEnabled }));
    get().persistState();
  },
  
  // Event operations
  createEventFromTask: async (task) => {
    try {
      if (!get().isCalendarSyncEnabled || !get().selectedCalendarId) {
        return null;
      }
      
      const hasPermission = await get().requestCalendarPermissions();
      if (!hasPermission) {
        return null;
      }
      
      // Check if task already has an event
      const existingEvent = get().events.find(event => event.taskId === task.id);
      if (existingEvent) {
        return existingEvent.id;
      }
      
      // Create event details
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
      
      if (task.dueTime) {
        const dueTime = new Date(task.dueTime);
        startDate.setHours(dueTime.getHours(), dueTime.getMinutes());
        endDate.setHours(dueTime.getHours() + 1, dueTime.getMinutes());
      }
      
      // Create the event
      const eventDetails = {
        title: task.title,
        notes: task.notes,
        startDate,
        endDate,
        allDay: !task.dueTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      const calendarId = get().selectedCalendarId;
      if (!calendarId) {
        return null;
      }
      
      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      
      // Save the event in our store
      const newEvent: CalendarEvent = {
        id: uuidv4(),
        taskId: task.id,
        calendarId,
        eventId,
        title: task.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        allDay: !task.dueTime,
        notes: task.notes,
      };
      
      set(state => ({
        events: [...state.events, newEvent]
      }));
      
      await get().persistState();
      
      return newEvent.id;
    } catch (error) {
      console.error('Error creating event from task:', error);
      return null;
    }
  },
  
  updateEventFromTask: async (task) => {
    try {
      if (!get().isCalendarSyncEnabled) {
        return false;
      }
      
      const existingEvent = get().events.find(event => event.taskId === task.id);
      if (!existingEvent) {
        // If no event exists, create one
        await get().createEventFromTask(task);
        return true;
      }
      
      // Update event details
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
      
      if (task.dueTime) {
        const dueTime = new Date(task.dueTime);
        startDate.setHours(dueTime.getHours(), dueTime.getMinutes());
        endDate.setHours(dueTime.getHours() + 1, dueTime.getMinutes());
      }
      
      // Update the event
      const eventDetails = {
        title: task.title,
        notes: task.notes,
        startDate,
        endDate,
        allDay: !task.dueTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      await Calendar.updateEventAsync(existingEvent.eventId, eventDetails);
      
      // Update the event in our store
      set(state => ({
        events: state.events.map(event => 
          event.id === existingEvent.id
            ? {
                ...event,
                title: task.title,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                allDay: !task.dueTime,
                notes: task.notes,
              }
            : event
        )
      }));
      
      await get().persistState();
      
      return true;
    } catch (error) {
      console.error('Error updating event from task:', error);
      return false;
    }
  },
  
  deleteEventForTask: async (taskId) => {
    try {
      const existingEvent = get().events.find(event => event.taskId === taskId);
      if (!existingEvent) {
        return true; // No event to delete
      }
      
      // Delete the event from the calendar
      await Calendar.deleteEventAsync(existingEvent.eventId);
      
      // Remove the event from our store
      set(state => ({
        events: state.events.filter(event => event.taskId !== taskId)
      }));
      
      await get().persistState();
      
      return true;
    } catch (error) {
      console.error('Error deleting event for task:', error);
      return false;
    }
  },
  
  // Storage operations
  initializeState: async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('calendarEvents');
      const storedSelectedCalendarId = await AsyncStorage.getItem('selectedCalendarId');
      const storedIsCalendarSyncEnabled = await AsyncStorage.getItem('isCalendarSyncEnabled');
      
      set({
        events: storedEvents ? JSON.parse(storedEvents) : [],
        selectedCalendarId: storedSelectedCalendarId,
        isCalendarSyncEnabled: storedIsCalendarSyncEnabled === 'true',
      });
      
      // Load calendars
      await get().getCalendars();
    } catch (error) {
      console.error('Error initializing calendar store:', error);
    }
  },
  
  persistState: async () => {
    try {
      const { events, selectedCalendarId, isCalendarSyncEnabled } = get();
      
      await AsyncStorage.setItem('calendarEvents', JSON.stringify(events));
      
      if (selectedCalendarId) {
        await AsyncStorage.setItem('selectedCalendarId', selectedCalendarId);
      }
      
      await AsyncStorage.setItem('isCalendarSyncEnabled', isCalendarSyncEnabled.toString());
    } catch (error) {
      console.error('Error persisting calendar store:', error);
    }
  },
}));

export default useCalendarStore; 