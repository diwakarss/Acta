/**
 * Routes Constants
 * 
 * This file defines constants for all navigation routes in the application.
 * Using these constants ensures consistency and makes refactoring easier.
 */

export const ROUTES = {
  // Tab Routes
  HOME: '/(tabs)',
  TODAY: '/(tabs)/today',
  PROJECTS: '/(tabs)/projects',
  CALENDAR: '/(tabs)/calendar',
  SETTINGS: '/(tabs)/settings',

  // Authentication Routes
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Settings Routes
  ACCOUNT_SETTINGS: '/settings/account',
  EMAIL_SETTINGS: '/settings/email',
  THEME_SETTINGS: '/settings/theme',
  NOTIFICATIONS_SETTINGS: '/settings/notifications',

  // Task Routes
  TASK_DETAILS: '/task/[id]',
  NEW_TASK: '/task/new',
  
  // Project Routes
  PROJECT_DETAILS: '/project/[id]',
  NEW_PROJECT: '/project/new',

  // Widget Routes
  WIDGETS: '/widgets',
  WIDGET_ADD: '/widgets/add',
  WIDGET_EDIT: '/widgets/edit/[id]',
}; 