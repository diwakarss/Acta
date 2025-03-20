// Type definitions for task management

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  notes: string;
  checklist: ChecklistItem[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  dueTime: string | null;
  reminder: string | null;
  repeatOption: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  tags: string[]; // Tag IDs
  projectId: string | null;
  areaId: string | null;
  icon?: string;
  color?: string;
  isEveningTask: boolean;
  isSomedayTask: boolean;
  // Logbook related fields
  completedAt: string | null;
  archived: boolean;
  category: 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  areaId: string | null;
  headings: Heading[];
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
};

export type Heading = {
  id: string;
  name: string;
  projectId: string;
  order: number;
};

export type Area = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}; 