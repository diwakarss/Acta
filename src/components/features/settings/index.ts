/**
 * Settings Feature Components
 * 
 * This directory contains components specific to the settings feature.
 * These components handle theme settings, notification settings, account settings, etc.
 */

// Export settings components
export { default as AccountSettings } from './account';
export { default as EmailSettings } from './email';
export { default as SettingsScreen } from './settings';
export { default as ShortcutsSettings } from './shortcuts';

// As components are moved here, export them from this barrel file
// Example: export { default as ThemeSettings } from './ThemeSettings';
// Example: export { default as NotificationSettings } from './NotificationSettings'; 