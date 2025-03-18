import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Appbar } from 'react-native-paper';
import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';

export default function TabLayout() {
  const theme = useTheme();
  
  // Common header for all tabs
  const renderHeader = (title: string) => {
    return {
      header: ({ navigation, route, options }: BottomTabHeaderProps) => {
        return (
          <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
            <Appbar.Content title={title} />
          </Appbar.Header>
        );
      }
    };
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: true, // Show header for all tabs
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'today' : 'today-outline'} size={size} color={color} />
          ),
          ...renderHeader('Today')
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
          ...renderHeader('Upcoming')
        }}
      />
      <Tabs.Screen
        name="anytime"
        options={{
          title: 'Anytime',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
          ...renderHeader('Anytime')
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={size} color={color} />
          ),
          ...renderHeader('Projects')
        }}
      />
      <Tabs.Screen
        name="areas"
        options={{
          title: 'Areas',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
          ...renderHeader('Areas')
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }: { color: string, size: number, focused: boolean }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
          ...renderHeader('Settings')
        }}
      />
    </Tabs>
  );
}
