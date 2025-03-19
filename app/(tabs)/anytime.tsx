import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Text, useTheme, FAB, Modal, Portal, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import TaskList from '@/src/components/features/tasks/TaskList';
import TaskForm from '@/src/components/features/tasks/TaskForm';
import useTaskStore from '@/src/store/taskStore';
import { Task } from '@/src/types';

export default function AnytimeScreen() {
  const theme = useTheme();
  const getAnytimeTasks = useTaskStore(state => state.getAnytimeTasks);
  const getSomedayTasks = useTaskStore(state => state.getSomedayTasks);
  
  const [anytimeTasks, setAnytimeTasks] = useState<Task[]>([]);
  const [somedayTasks, setSomedayTasks] = useState<Task[]>([]);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSomedayTask, setIsSomedayTask] = useState(false);
  
  // Load tasks when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
      return () => {};
    }, [])
  );
  
  // Load tasks from the store
  const loadTasks = () => {
    setAnytimeTasks(getAnytimeTasks());
    setSomedayTasks(getSomedayTasks());
  };
  
  // Handle task press
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setIsSomedayTask(task.isSomedayTask);
    setIsAddTaskModalVisible(true);
  };
  
  // Handle add task button press
  const handleAddTask = (isSomeday: boolean = false) => {
    setSelectedTask(null);
    setIsSomedayTask(isSomeday);
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
          <Text style={[styles.header, { color: theme.colors.onBackground }]}>Anytime</Text>
          
          {/* Anytime Tasks */}
          <View style={styles.section}>
            <TaskList
              tasks={anytimeTasks}
              title="Anytime Tasks"
              onTaskPress={handleTaskPress}
              onAddTask={() => handleAddTask(false)}
              emptyMessage="No anytime tasks"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Someday Tasks */}
          <View style={styles.section}>
            <TaskList
              tasks={somedayTasks}
              title="Someday"
              onTaskPress={handleTaskPress}
              onAddTask={() => handleAddTask(true)}
              emptyMessage="No someday tasks"
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
  divider: {
    marginVertical: 16,
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