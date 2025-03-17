// Type definitions for widget system

export type WidgetSize = 'small' | 'medium' | 'large';

export type WidgetType = 'today' | 'upcoming' | 'anytime' | 'project' | 'area' | 'tag';

export type Widget = {
  id: string;
  title: string;
  type: WidgetType;
  entityId?: string; // For project, area, or tag widgets
  size: WidgetSize;
  color: string;
  icon: string;
  position: number;
}; 