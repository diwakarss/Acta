import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

import Widget from '../../src/components/Widget';
import useTaskStore from '../../src/store/taskStore';
import useWidgetStore from '../../src/store/widgetStore';

export default function WidgetsScreen() {
  const { widgets, reorderWidgets, removeWidget } = useWidgetStore();
  const { 
    tasks, 
    getTodayTasks, 
    getUpcomingTasks, 
    getAnytimeTasks, 
    getTasksByProject, 
    getTasksByArea, 
    getTasksByTag 
  } = useTaskStore();
  
  // Get tasks for each widget
  const getTasksForWidget = (widget: any) => {
    switch (widget.type) {
      case 'today':
        return getTodayTasks();
      case 'upcoming':
        return getUpcomingTasks();
      case 'anytime':
        return getAnytimeTasks();
      case 'project':
        return getTasksByProject(widget.entityId);
      case 'area':
        return getTasksByArea(widget.entityId);
      case 'tag':
        return getTasksByTag(widget.entityId);
      default:
        return [];
    }
  };
  
  // Handle widget press
  const handleWidgetPress = (widget: any) => {
    switch (widget.type) {
      case 'today':
        router.push('/(tabs)/today');
        break;
      case 'upcoming':
        router.push('/(tabs)/upcoming');
        break;
      case 'anytime':
        router.push('/(tabs)/anytime');
        break;
      case 'project':
        router.push(`/projects/${widget.entityId}`);
        break;
      case 'area':
        router.push(`/areas/${widget.entityId}`);
        break;
      case 'tag':
        router.push(`/tags/${widget.entityId}`);
        break;
    }
  };
  
  // Handle task press
  const handleTaskPress = (task: any) => {
    router.push(`/tasks/${task.id}`);
  };
  
  // Handle widget removal
  const handleRemoveWidget = (id: string) => {
    Alert.alert(
      'Remove Widget',
      'Are you sure you want to remove this widget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeWidget(id)
        }
      ]
    );
  };
  
  // Render widget item
  const renderWidgetItem = ({ item, drag, isActive }: any) => {
    const widgetTasks = getTasksForWidget(item);
    
    return (
      <ScaleDecorator>
        <View style={styles.widgetContainer}>
          <Widget
            title={item.title}
            tasks={widgetTasks}
            size={item.size}
            color={item.color}
            icon={item.icon}
            onPress={() => handleWidgetPress(item)}
            onTaskPress={handleTaskPress}
          />
          
          <View style={styles.widgetActions}>
            <TouchableOpacity 
              style={styles.widgetAction}
              onPress={() => router.push(`/widgets/edit/${item.id}`)}
            >
              <Ionicons name="pencil" size={18} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.widgetAction}
              onPress={() => handleRemoveWidget(item.id)}
            >
              <Ionicons name="trash" size={18} color="#FF3B30" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.widgetAction}
              onLongPress={drag}
              disabled={isActive}
            >
              <Ionicons name="menu" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScaleDecorator>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Widgets' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Manage Widgets</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/widgets/add')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>
        Widgets provide quick access to your tasks. Drag to reorder, tap to view details.
      </Text>
      
      {widgets.length > 0 ? (
        <DraggableFlatList
          data={widgets}
          onDragEnd={({ data }) => reorderWidgets(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderWidgetItem}
          contentContainerStyle={styles.widgetsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="apps" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No widgets added yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first widget
          </Text>
          <TouchableOpacity 
            style={styles.emptyAddButton}
            onPress={() => router.push('/widgets/add')}
          >
            <Text style={styles.emptyAddButtonText}>Add Widget</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  widgetsList: {
    paddingBottom: 20,
  },
  widgetContainer: {
    marginBottom: 16,
  },
  widgetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  widgetAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyAddButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 