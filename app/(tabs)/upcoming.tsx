import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Text, useTheme, FAB, Modal, Portal, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { format, isToday, isTomorrow, addDays, isSameDay, isThisWeek, isThisMonth } from 'date-fns';

import TaskList from '@/src/components/features/tasks/TaskList';
import TaskForm from '@/src/components/features/tasks/TaskForm';
import useTaskStore from '@/src/store/taskStore';
import { Task } from '@/src/types';

export default function UpcomingScreen() {
  const theme = useTheme();
  const getUpcomingTasks = useTaskStore(state => state.getUpcomingTasks);
  
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Load tasks when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
      return () => {};
    }, [])
  );
  
  // Load tasks from the store
  const loadTasks = () => {
    setUpcomingTasks(getUpcomingTasks());
  };
  
  // Handle task press
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setIsAddTaskModalVisible(true);
  };
  
  // Handle add task button press
  const handleAddTask = () => {
    setSelectedTask(null);
    setIsAddTaskModalVisible(true);
  };
  
  // Handle task form save
  const handleTaskFormSave = () => {
    setIsAddTaskModalVisible(false);
    loadTasks();
  };
  
  // Handle task form cancel
  const handleTaskFormCancel = () => {
    setIsAddTaskModalVisible(false);
  };
  
  // Group tasks by date
  const groupTasksByDate = () => {
    const groups: { [key: string]: Task[] } = {};
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    upcomingTasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      let groupKey = '';
      
      if (isToday(dueDate)) {
        groupKey = 'Today';
      } else if (isTomorrow(dueDate)) {
        groupKey = 'Tomorrow';
      } else if (isThisWeek(dueDate)) {
        groupKey = 'This Week';
      } else if (isThisMonth(dueDate)) {
        groupKey = 'This Month';
      } else {
        groupKey = 'Later';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(task);
    });
    
    return groups;
  };
  
  const taskGroups = groupTasksByDate();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.header, { color: theme.colors.onBackground }]}>Upcoming</Text>
          
          {Object.keys(taskGroups).length > 0 ? (
            Object.entries(taskGroups).map(([groupName, tasks], index) => (
              <View key={groupName} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                  {groupName}
                </Text>
                <TaskList
                  tasks={tasks}
                  onTaskPress={handleTaskPress}
                  emptyMessage={`No tasks for ${groupName.toLowerCase()}`}
                />
                {index < Object.keys(taskGroups).length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No upcoming tasks
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Add Task FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddTask}
      />
      
      {/* Add/Edit Task Modal */}
      <Portal>
        <Modal
          visible={isAddTaskModalVisible}
          onDismiss={handleTaskFormCancel}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <TaskForm
            task={selectedTask || undefined}
            onSave={handleTaskFormSave}
            onCancel={handleTaskFormCancel}
          />
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
  },
}); 