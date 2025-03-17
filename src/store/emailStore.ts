import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import * as MailComposer from 'expo-mail-composer';
import { Alert, Linking } from 'react-native';

import { Task } from './taskStore';

// Define types for our email system
export type EmailSettings = {
  forwardingAddress: string;
  isEmailToTaskEnabled: boolean;
  lastSyncTimestamp: number | null;
};

export type EmailToTaskRule = {
  id: string;
  name: string;
  isEnabled: boolean;
  fromAddresses: string[];
  subjectContains: string[];
  bodyContains: string[];
  assignToProject: string | null;
  assignToArea: string | null;
  addTags: string[];
  isEveningTask: boolean;
  isSomedayTask: boolean;
};

// Define the store state
interface EmailState {
  settings: EmailSettings;
  rules: EmailToTaskRule[];
  
  // Settings operations
  updateForwardingAddress: (address: string) => void;
  toggleEmailToTask: () => void;
  
  // Rule operations
  addRule: (rule: Omit<EmailToTaskRule, 'id'>) => string;
  updateRule: (id: string, updates: Partial<Omit<EmailToTaskRule, 'id'>>) => boolean;
  deleteRule: (id: string) => void;
  
  // Email operations
  sendTaskViaEmail: (task: Task) => Promise<boolean>;
  parseEmailToTask: (subject: string, body: string, from: string) => Partial<Task> | null;
  
  // Storage operations
  initializeState: () => Promise<void>;
  persistState: () => Promise<void>;
}

// Create the store
const useEmailStore = create<EmailState>((set, get) => ({
  settings: {
    forwardingAddress: '',
    isEmailToTaskEnabled: false,
    lastSyncTimestamp: null,
  },
  rules: [],
  
  // Settings operations
  updateForwardingAddress: (address) => {
    set(state => ({
      settings: {
        ...state.settings,
        forwardingAddress: address,
      }
    }));
    get().persistState();
  },
  
  toggleEmailToTask: () => {
    set(state => ({
      settings: {
        ...state.settings,
        isEmailToTaskEnabled: !state.settings.isEmailToTaskEnabled,
      }
    }));
    get().persistState();
  },
  
  // Rule operations
  addRule: (rule) => {
    const id = uuidv4();
    set(state => ({
      rules: [...state.rules, { ...rule, id }]
    }));
    get().persistState();
    return id;
  },
  
  updateRule: (id, updates) => {
    let found = false;
    set(state => ({
      rules: state.rules.map(rule => {
        if (rule.id === id) {
          found = true;
          return { ...rule, ...updates };
        }
        return rule;
      })
    }));
    if (found) {
      get().persistState();
    }
    return found;
  },
  
  deleteRule: (id) => {
    set(state => ({
      rules: state.rules.filter(rule => rule.id !== id)
    }));
    get().persistState();
  },
  
  // Email operations
  sendTaskViaEmail: async (task) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Email Not Available',
          'No email client is configured on this device.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      // Format task details for email
      const subject = `Task: ${task.title}`;
      let body = `Task Details:\n\n`;
      body += `Title: ${task.title}\n`;
      if (task.notes) body += `Notes: ${task.notes}\n`;
      if (task.dueDate) body += `Due Date: ${new Date(task.dueDate).toLocaleDateString()}\n`;
      if (task.tags && task.tags.length > 0) body += `Tags: ${task.tags.join(', ')}\n`;
      if (task.checklist && task.checklist.length > 0) {
        body += `\nChecklist:\n`;
        task.checklist.forEach(item => {
          body += `- ${item.completed ? '[x]' : '[ ]'} ${item.text}\n`;
        });
      }
      
      await MailComposer.composeAsync({
        subject,
        body,
        isHtml: false,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending task via email:', error);
      return false;
    }
  },
  
  parseEmailToTask: (subject, body, from) => {
    if (!get().settings.isEmailToTaskEnabled) {
      return null;
    }
    
    // Find matching rules
    const matchingRules = get().rules.filter(rule => {
      if (!rule.isEnabled) return false;
      
      // Check from address
      if (rule.fromAddresses.length > 0 && 
          !rule.fromAddresses.some(addr => from.includes(addr))) {
        return false;
      }
      
      // Check subject
      if (rule.subjectContains.length > 0 && 
          !rule.subjectContains.some(text => subject.includes(text))) {
        return false;
      }
      
      // Check body
      if (rule.bodyContains.length > 0 && 
          !rule.bodyContains.some(text => body.includes(text))) {
        return false;
      }
      
      return true;
    });
    
    if (matchingRules.length === 0) {
      return null;
    }
    
    // Use the first matching rule
    const rule = matchingRules[0];
    
    // Create task from email
    const task: Partial<Task> = {
      title: subject,
      notes: body.substring(0, 500), // Limit notes to 500 chars
      createdAt: new Date().toISOString(),
      projectId: rule.assignToProject,
      areaId: rule.assignToArea,
      tags: rule.addTags.length > 0 ? rule.addTags : [],
      isEveningTask: rule.isEveningTask,
      isSomedayTask: rule.isSomedayTask,
      checklist: [],
      completed: false,
    };
    
    return task;
  },
  
  // Storage operations
  initializeState: async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('emailSettings');
      const storedRules = await AsyncStorage.getItem('emailRules');
      
      if (storedSettings) {
        set({ settings: JSON.parse(storedSettings) });
      }
      
      if (storedRules) {
        set({ rules: JSON.parse(storedRules) });
      }
    } catch (error) {
      console.error('Error initializing email store:', error);
    }
  },
  
  persistState: async () => {
    try {
      await AsyncStorage.setItem('emailSettings', JSON.stringify(get().settings));
      await AsyncStorage.setItem('emailRules', JSON.stringify(get().rules));
    } catch (error) {
      console.error('Error persisting email store:', error);
    }
  },
}));

export default useEmailStore; 