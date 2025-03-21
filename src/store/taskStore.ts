import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { StoreApi } from 'zustand';
import { Platform } from 'react-native';

// Import cloud sync utilities
import cloudSync from '@/src/utils/api/cloudSync';

import { 
  Task, 
  ChecklistItem, 
  Tag, 
  Project, 
  Heading, 
  Area 
} from '../types';

// Create a singleton object that maintains the same reference for web
const stableSyncStatus: { isSyncing: boolean; lastSyncTime: number | null } = {
  isSyncing: false,
  lastSyncTime: null
};

// Define the store state
interface TaskState {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  tags: Tag[];
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Checklist operations
  addChecklistItem: (taskId: string, text: string) => void;
  updateChecklistItem: (taskId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  reorderChecklistItems: (taskId: string, newOrder: string[]) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'headings'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Heading operations
  addHeading: (projectId: string, name: string) => void;
  updateHeading: (projectId: string, headingId: string, name: string) => void;
  deleteHeading: (projectId: string, headingId: string) => void;
  reorderHeadings: (projectId: string, newOrder: string[]) => void;
  
  // Area operations
  addArea: (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  
  // Tag operations
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  // Filter operations
  getTasksByProject: (projectId: string) => Task[];
  getTasksByArea: (areaId: string) => Task[];
  getTasksByTag: (tagId: string) => Task[];
  getTodayTasks: () => Task[];
  getEveningTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getAnytimeTasks: () => Task[];
  getSomedayTasks: () => Task[];
  
  // Storage operations
  initializeState: () => Promise<void>;
  persistState: () => Promise<void>;
  forceSync: () => Promise<boolean>;
  getLastSyncStatus: () => { isSyncing: boolean; lastSyncTime: number | null };
}

// Create the store
const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  projects: [],
  areas: [],
  tags: [],
  isSyncing: false,
  lastSyncTime: null,
  
  // Task operations
  addTask: (taskData) => {
    const newTask: Task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData
    };
    
    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));
    
    get().persistState();
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
    
    get().persistState();
  },
  
  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id 
          ? { ...task, completed: true, updatedAt: new Date().toISOString() } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  // Checklist operations
  addChecklistItem: (taskId, text) => {
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text,
      completed: false
    };
    
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId 
          ? { 
              ...task, 
              checklist: [...task.checklist, newItem],
              updatedAt: new Date().toISOString() 
            } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  updateChecklistItem: (taskId, itemId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId 
          ? { 
              ...task, 
              checklist: task.checklist.map((item) => 
                item.id === itemId ? { ...item, ...updates } : item
              ),
              updatedAt: new Date().toISOString() 
            } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  deleteChecklistItem: (taskId, itemId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId 
          ? { 
              ...task, 
              checklist: task.checklist.filter((item) => item.id !== itemId),
              updatedAt: new Date().toISOString() 
            } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  toggleChecklistItem: (taskId, itemId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId 
          ? { 
              ...task, 
              checklist: task.checklist.map((item) => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
              updatedAt: new Date().toISOString() 
            } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  reorderChecklistItems: (taskId, newOrder) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;
      
      const reorderedChecklist = newOrder.map(
        id => task.checklist.find(item => item.id === id)!
      );
      
      return {
        tasks: state.tasks.map((t) => 
          t.id === taskId 
            ? { 
                ...t, 
                checklist: reorderedChecklist,
                updatedAt: new Date().toISOString() 
              } 
            : t
        )
      };
    });
    
    get().persistState();
  },
  
  // Project operations
  addProject: (projectData) => {
    const newProject: Project = {
      id: uuidv4(),
      headings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...projectData
    };
    
    set((state) => ({
      projects: [...state.projects, newProject]
    }));
    
    get().persistState();
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) => 
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date().toISOString() } 
          : project
      )
    }));
    
    get().persistState();
  },
  
  deleteProject: (id) => {
    // Delete the project and update any tasks that were in this project
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      tasks: state.tasks.map((task) => 
        task.projectId === id 
          ? { ...task, projectId: null, updatedAt: new Date().toISOString() } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  // Heading operations
  addHeading: (projectId, name) => {
    const newHeading: Heading = {
      id: uuidv4(),
      name,
      projectId,
      order: get().projects.find(p => p.id === projectId)?.headings.length || 0
    };
    
    set((state) => ({
      projects: state.projects.map((project) => 
        project.id === projectId 
          ? { 
              ...project, 
              headings: [...project.headings, newHeading],
              updatedAt: new Date().toISOString() 
            } 
          : project
      )
    }));
    
    get().persistState();
  },
  
  updateHeading: (projectId, headingId, name) => {
    set((state) => ({
      projects: state.projects.map((project) => 
        project.id === projectId 
          ? { 
              ...project, 
              headings: project.headings.map((heading) => 
                heading.id === headingId ? { ...heading, name } : heading
              ),
              updatedAt: new Date().toISOString() 
            } 
          : project
      )
    }));
    
    get().persistState();
  },
  
  deleteHeading: (projectId, headingId) => {
    set((state) => ({
      projects: state.projects.map((project) => 
        project.id === projectId 
          ? { 
              ...project, 
              headings: project.headings.filter((heading) => heading.id !== headingId),
              updatedAt: new Date().toISOString() 
            } 
          : project
      )
    }));
    
    get().persistState();
  },
  
  reorderHeadings: (projectId, newOrder) => {
    set((state) => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return state;
      
      const reorderedHeadings = newOrder.map(
        (id, index) => {
          const heading = project.headings.find(h => h.id === id)!;
          return { ...heading, order: index };
        }
      );
      
      return {
        projects: state.projects.map((p) => 
          p.id === projectId 
            ? { 
                ...p, 
                headings: reorderedHeadings,
                updatedAt: new Date().toISOString() 
              } 
            : p
        )
      };
    });
    
    get().persistState();
  },
  
  // Area operations
  addArea: (areaData) => {
    const newArea: Area = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...areaData
    };
    
    set((state) => ({
      areas: [...state.areas, newArea]
    }));
    
    get().persistState();
  },
  
  updateArea: (id, updates) => {
    set((state) => ({
      areas: state.areas.map((area) => 
        area.id === id 
          ? { ...area, ...updates, updatedAt: new Date().toISOString() } 
          : area
      )
    }));
    
    get().persistState();
  },
  
  deleteArea: (id) => {
    // Delete the area and update any projects and tasks that were in this area
    set((state) => ({
      areas: state.areas.filter((area) => area.id !== id),
      projects: state.projects.map((project) => 
        project.areaId === id 
          ? { ...project, areaId: null, updatedAt: new Date().toISOString() } 
          : project
      ),
      tasks: state.tasks.map((task) => 
        task.areaId === id 
          ? { ...task, areaId: null, updatedAt: new Date().toISOString() } 
          : task
      )
    }));
    
    get().persistState();
  },
  
  // Tag operations
  addTag: (tagData) => {
    const newTag: Tag = {
      id: uuidv4(),
      ...tagData
    };
    
    set((state) => ({
      tags: [...state.tags, newTag]
    }));
    
    get().persistState();
  },
  
  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) => 
        tag.id === id 
          ? { ...tag, ...updates } 
          : tag
      )
    }));
    
    get().persistState();
  },
  
  deleteTag: (id) => {
    // Delete the tag and remove it from any tasks that had it
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      tasks: state.tasks.map((task) => ({
        ...task,
        tags: task.tags.filter(tagId => tagId !== id),
        updatedAt: task.tags.includes(id) ? new Date().toISOString() : task.updatedAt
      }))
    }));
    
    get().persistState();
  },
  
  // Filter operations
  getTasksByProject: (projectId) => {
    return get().tasks.filter(task => task.projectId === projectId);
  },
  
  getTasksByArea: (areaId) => {
    // Get tasks directly in the area and tasks in projects that are in the area
    const projectsInArea = get().projects.filter(project => project.areaId === areaId);
    const projectIds = projectsInArea.map(project => project.id);
    
    return get().tasks.filter(task => 
      task.areaId === areaId || (task.projectId && projectIds.includes(task.projectId))
    );
  },
  
  getTasksByTag: (tagId) => {
    return get().tasks.filter(task => task.tags.includes(tagId));
  },
  
  getTodayTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().tasks.filter(task => {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      if (task.isEveningTask) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() <= today.getTime();
    });
  },
  
  getEveningTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().tasks.filter(task => {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      if (!task.isEveningTask) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() <= today.getTime();
    });
  },
  
  getUpcomingTasks: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().tasks.filter(task => {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() > today.getTime();
    }).sort((a, b) => {
      const dateA = new Date(a.dueDate!);
      const dateB = new Date(b.dueDate!);
      return dateA.getTime() - dateB.getTime();
    });
  },
  
  getAnytimeTasks: () => {
    return get().tasks.filter(task => {
      return !task.completed && !task.dueDate && !task.isSomedayTask;
    });
  },
  
  getSomedayTasks: () => {
    return get().tasks.filter(task => {
      return !task.completed && task.isSomedayTask;
    });
  },
  
  // Get the current sync status - memoized to prevent infinite loops
  getLastSyncStatus: () => {
    // Get the current state
    const state = get();
    
    // Use a static object for web platform to prevent reference changes
    if (Platform.OS === 'web') {
      // Update values but keep the same reference
      stableSyncStatus.isSyncing = state.isSyncing;
      stableSyncStatus.lastSyncTime = state.lastSyncTime;
      
      // Return the stable reference
      return stableSyncStatus;
    }
    
    // For native, return a new object each time
    return {
      isSyncing: state.isSyncing,
      lastSyncTime: state.lastSyncTime
    };
  },
  
  // Force sync data to the cloud with timeout protection
  forceSync: async () => {
    set({ isSyncing: true });
    
    try {
      // For web, add timeout protection
      if (Platform.OS === 'web') {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sync operation timed out')), 5000);
        });
        
        await Promise.race([
          cloudSync.forceSyncToCloud(),
          timeoutPromise
        ]);
      } else {
        // For native, proceed normally
        await cloudSync.forceSyncToCloud();
      }
      
      set({ 
        isSyncing: false,
        lastSyncTime: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error during force sync:', error);
      set({ isSyncing: false });
      return false;
    }
  },
  
  // Storage operations
  initializeState: async () => {
    set({ isSyncing: true });
    
    try {
      // First, load data from local storage to ensure quick app startup
      const loadLocalData = async () => {
        try {
          const storedTasks = await AsyncStorage.getItem('tasks');
          const storedProjects = await AsyncStorage.getItem('projects');
          const storedAreas = await AsyncStorage.getItem('areas');
          const storedTags = await AsyncStorage.getItem('tags');
          
          // Use local data first for fast startup
          set({
            tasks: storedTasks ? JSON.parse(storedTasks) : [],
            projects: storedProjects ? JSON.parse(storedProjects) : [],
            areas: storedAreas ? JSON.parse(storedAreas) : [],
            tags: storedTags ? JSON.parse(storedTags) : []
          });
          
          return {
            hasLocalData: !!(storedTasks || storedProjects || storedAreas || storedTags)
          };
        } catch (localError) {
          console.error('Error reading from local storage:', localError);
          return { hasLocalData: false };
        }
      };
      
      // First load local data for immediate display
      const { hasLocalData } = await loadLocalData();
      
      // Then try to merge with cloud data
      try {
        // Process any pending operations first
        await cloudSync.processSyncQueue();
        
        // Try to get data through cloud sync merging
        const tasks = await cloudSync.mergeData('tasks');
        const projects = await cloudSync.mergeData('projects');
        const areas = await cloudSync.mergeData('areas');
        const tags = await cloudSync.mergeData('tags');
        
        set({
          tasks: tasks || [],
          projects: projects || [],
          areas: areas || [],
          tags: tags || [],
          lastSyncTime: Date.now()
        });
        
        // Set up real-time syncing for tasks
        cloudSync.setupCloudSync('tasks', (updatedTasks) => {
          if (updatedTasks) {
            set({ 
              tasks: updatedTasks,
              lastSyncTime: Date.now()
            });
          }
        });
        
        // Set up real-time syncing for projects
        cloudSync.setupCloudSync('projects', (updatedProjects) => {
          if (updatedProjects) {
            set({ 
              projects: updatedProjects,
              lastSyncTime: Date.now()
            });
          }
        });
        
        // Set up real-time syncing for areas
        cloudSync.setupCloudSync('areas', (updatedAreas) => {
          if (updatedAreas) {
            set({ 
              areas: updatedAreas,
              lastSyncTime: Date.now()
            });
          }
        });
        
        // Set up real-time syncing for tags
        cloudSync.setupCloudSync('tags', (updatedTags) => {
          if (updatedTags) {
            set({ 
              tags: updatedTags,
              lastSyncTime: Date.now()
            });
          }
        });
      } catch (cloudError) {
        console.error('Error syncing with cloud:', cloudError);
        
        // We already loaded local data, so we can continue using that
        if (!hasLocalData) {
          // Initialize with empty arrays as last resort if no local data
          set({
            tasks: [],
            projects: [],
            areas: [],
            tags: []
          });
        }
      }
    } catch (error) {
      console.error('Error initializing task store:', error);
      
      // Fall back to local storage if cloud sync fails
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        const storedProjects = await AsyncStorage.getItem('projects');
        const storedAreas = await AsyncStorage.getItem('areas');
        const storedTags = await AsyncStorage.getItem('tags');
        
        set({
          tasks: storedTasks ? JSON.parse(storedTasks) : [],
          projects: storedProjects ? JSON.parse(storedProjects) : [],
          areas: storedAreas ? JSON.parse(storedAreas) : [],
          tags: storedTags ? JSON.parse(storedTags) : []
        });
      } catch (localError) {
        console.error('Error reading from local storage:', localError);
        // Initialize with empty arrays as last resort
        set({
          tasks: [],
          projects: [],
          areas: [],
          tags: []
        });
      }
    } finally {
      set({ isSyncing: false });
    }
  },
  
  persistState: async () => {
    try {
      const { tasks, projects, areas, tags } = get();
      
      // Optimistically update local state immediately
      await Promise.all([
        AsyncStorage.setItem('tasks', JSON.stringify(tasks)),
        AsyncStorage.setItem('projects', JSON.stringify(projects)),
        AsyncStorage.setItem('areas', JSON.stringify(areas)),
        AsyncStorage.setItem('tags', JSON.stringify(tags))
      ]);
      
      // Then try to sync to cloud in background
      // We don't await these because we want to return quickly to keep the UI responsive
      cloudSync.syncToCloud('tasks', tasks);
      cloudSync.syncToCloud('projects', projects);
      cloudSync.syncToCloud('areas', areas);
      cloudSync.syncToCloud('tags', tags);
      
      // Update last sync time once all sync operations have been dispatched
      set({ lastSyncTime: Date.now() });
    } catch (error) {
      console.error('Error persisting task store:', error);
    }
  }
}));

export default useTaskStore; 