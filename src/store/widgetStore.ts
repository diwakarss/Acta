import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

import { Widget, WidgetSize, WidgetType } from '../types';

// Define the store state
interface WidgetState {
  widgets: Widget[];
  
  // Widget operations
  addWidget: (widget: Omit<Widget, 'id' | 'position'>) => string;
  updateWidget: (id: string, updates: Partial<Omit<Widget, 'id' | 'position'>>) => boolean;
  removeWidget: (id: string) => void;
  reorderWidgets: (newOrder: Widget[]) => void;
  
  // Storage operations
  initializeState: () => Promise<void>;
  persistState: () => Promise<void>;
}

// Create the store
const useWidgetStore = create<WidgetState>((set, get) => ({
  widgets: [],
  
  // Widget operations
  addWidget: (widget) => {
    const id = uuidv4();
    const position = get().widgets.length;
    
    set(state => ({
      widgets: [...state.widgets, { ...widget, id, position }]
    }));
    
    get().persistState();
    return id;
  },
  
  updateWidget: (id, updates) => {
    let found = false;
    
    set(state => ({
      widgets: state.widgets.map(widget => {
        if (widget.id === id) {
          found = true;
          return { ...widget, ...updates };
        }
        return widget;
      })
    }));
    
    if (found) {
      get().persistState();
    }
    
    return found;
  },
  
  removeWidget: (id) => {
    set(state => ({
      widgets: state.widgets.filter(widget => widget.id !== id)
    }));
    
    // Update positions after removal
    set(state => ({
      widgets: state.widgets.map((widget, index) => ({
        ...widget,
        position: index
      }))
    }));
    
    get().persistState();
  },
  
  reorderWidgets: (newOrder) => {
    // Update positions based on new order
    const updatedWidgets = newOrder.map((widget, index) => ({
      ...widget,
      position: index
    }));
    
    set({ widgets: updatedWidgets });
    get().persistState();
  },
  
  // Storage operations
  initializeState: async () => {
    try {
      const storedWidgets = await AsyncStorage.getItem('widgets');
      
      if (storedWidgets) {
        set({ widgets: JSON.parse(storedWidgets) });
      } else {
        // Add default widgets if none exist
        const defaultWidgets: Widget[] = [
          {
            id: uuidv4(),
            title: 'Today',
            type: 'today',
            size: 'medium',
            color: '#007AFF',
            icon: 'today',
            position: 0
          },
          {
            id: uuidv4(),
            title: 'Upcoming',
            type: 'upcoming',
            size: 'medium',
            color: '#FF9500',
            icon: 'calendar',
            position: 1
          }
        ];
        
        set({ widgets: defaultWidgets });
        get().persistState();
      }
    } catch (error) {
      console.error('Error initializing widget store:', error);
    }
  },
  
  persistState: async () => {
    try {
      await AsyncStorage.setItem('widgets', JSON.stringify(get().widgets));
    } catch (error) {
      console.error('Error persisting widget store:', error);
    }
  },
}));

export default useWidgetStore; 