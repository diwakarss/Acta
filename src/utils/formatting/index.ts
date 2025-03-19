/**
 * Formatting Utilities
 * 
 * This directory contains utilities related to data formatting.
 * These utilities handle date formatting, string formatting, number formatting, etc.
 */

// Basic date formatting utility
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

// As more formatting utilities are created, export them from this barrel file
// Example: export * from './dateFormat'; 