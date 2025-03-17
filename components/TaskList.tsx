import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Searchbar, Menu, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { Task as TaskType } from '../src/types';
import TaskItem from './Task';

type TaskListProps = {
  tasks: TaskType[];
  title?: string;
  onTaskPress: (task: TaskType) => void;
  onAddTask?: () => void;
  emptyMessage?: string;
  showCompleted?: boolean;
};

type SortOption = 'title' | 'dueDate' | 'createdAt' | 'updatedAt';

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title,
  onTaskPress,
  onAddTask,
  emptyMessage = 'No tasks found',
  showCompleted = false,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortAscending, setSortAscending] = useState(true);
  
  // Filter tasks based on search query and completed status
  const filteredTasks = tasks.filter(task => {
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by completion status
    const matchesCompletion = showCompleted || !task.completed;
    
    return matchesSearch && matchesCompletion;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'dueDate':
        // Handle null due dates
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortAscending ? comparison : -comparison;
  });
  
  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // TODO: Implement task deletion
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Handle task editing
  const handleEditTask = (task: TaskType) => {
    // TODO: Implement task editing
    onTaskPress(task);
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortAscending(!sortAscending);
  };
  
  // Set sort option
  const handleSortBy = (option: SortOption) => {
    setSortBy(option);
    setSortMenuVisible(false);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      {title && (
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{title}</Text>
          {onAddTask && (
            <TouchableOpacity onPress={onAddTask}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Search and Sort */}
      <View style={styles.searchSortContainer}>
        <Searchbar
          placeholder="Search tasks"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
        
        <View style={styles.sortContainer}>
          <TouchableOpacity onPress={toggleSortDirection} style={styles.sortDirectionButton}>
            <Ionicons 
              name={sortAscending ? 'arrow-up' : 'arrow-down'} 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button 
                onPress={() => setSortMenuVisible(true)}
                mode="outlined"
                icon="sort"
                compact
              >
                Sort
              </Button>
            }
          >
            <Menu.Item 
              onPress={() => handleSortBy('title')} 
              title="Title" 
              leadingIcon={sortBy === 'title' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => handleSortBy('dueDate')} 
              title="Due Date" 
              leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => handleSortBy('createdAt')} 
              title="Created Date" 
              leadingIcon={sortBy === 'createdAt' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => handleSortBy('updatedAt')} 
              title="Updated Date" 
              leadingIcon={sortBy === 'updatedAt' ? 'check' : undefined}
            />
          </Menu>
        </View>
      </View>
      
      {/* Task List */}
      {sortedTasks.length > 0 ? (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={onTaskPress}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          {onAddTask && (
            <Button 
              mode="contained" 
              onPress={onAddTask}
              style={styles.addButton}
              icon="plus"
            >
              Add Task
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    height: 40,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortDirectionButton: {
    padding: 8,
    marginRight: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
});

export default TaskList; 