import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Text, useTheme, FAB, Modal, Portal } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import TaskList from '../../components/TaskList';
import TaskForm from '../../components/TaskForm';
import useTaskStore from '../../src/store/taskStore';
import { Task } from '../../src/store/taskStore';

export default function TodayScreen() {
  const theme = useTheme();
  const getTodayTasks = useTaskStore(state => state.getTodayTasks);
  const getEveningTasks = useTaskStore(state => state.getEveningTasks);
  
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [eveningTasks, setEveningTasks] = useState<Task[]>([]);
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
    setTodayTasks(getTodayTasks());
    setEveningTasks(getEveningTasks());
  };
  
  // Handle task press
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setIsAddTaskModalVisible(true);
  };
  
  // Handle add task button press
  const handleAddTask = (isEveningTask: boolean = false) => {
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
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.header, { color: theme.colors.onBackground }]}>Today</Text>
          
          {/* Today Tasks */}
          <View style={styles.section}>
            <TaskList
              tasks={todayTasks}
              title="Tasks"
              onTaskPress={handleTaskPress}
              onAddTask={() => handleAddTask(false)}
              emptyMessage="No tasks for today"
            />
          </View>
          
          {/* Evening Tasks */}
          <View style={styles.section}>
            <TaskList
              tasks={eveningTasks}
              title="This Evening"
              onTaskPress={handleTaskPress}
              onAddTask={() => handleAddTask(true)}
              emptyMessage="No evening tasks"
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Add Task FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => handleAddTask()}
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