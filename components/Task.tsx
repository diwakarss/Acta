import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Text, Checkbox } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { format } from 'date-fns';

import { Task as TaskType } from '../src/types';
import useTaskStore from '../src/store/taskStore';

type TaskProps = {
  task: TaskType;
  onPress: (task: TaskType) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: TaskType) => void;
};

const TaskItem: React.FC<TaskProps> = ({ task, onPress, onDelete, onEdit }) => {
  const theme = useTheme();
  const completeTask = useTaskStore(state => state.completeTask);
  
  const handleComplete = () => {
    completeTask(task.id);
  };
  
  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[
          styles.container, 
          { backgroundColor: theme.colors.surface }
        ]}
        onPress={() => onPress(task)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={task.completed ? 'checked' : 'unchecked'}
            onPress={handleComplete}
            color={theme.colors.primary}
          />
        </View>
        
        <View style={styles.contentContainer}>
          <Text 
            style={[
              styles.title, 
              task.completed && styles.completedText,
              { color: theme.colors.onSurface }
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.notes ? (
            <Text 
              style={[
                styles.notes, 
                task.completed && styles.completedText,
                { color: theme.colors.onSurfaceVariant }
              ]}
              numberOfLines={1}
            >
              {task.notes}
            </Text>
          ) : null}
          
          <View style={styles.metaContainer}>
            {task.dueDate ? (
              <View style={styles.dueDateContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.dueDate, { color: theme.colors.onSurfaceVariant }]}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {task.dueTime ? ` at ${format(new Date(task.dueTime), 'h:mm a')}` : ''}
                </Text>
              </View>
            ) : null}
            
            {task.tags && task.tags.length > 0 ? (
              <View style={styles.tagsContainer}>
                <Ionicons 
                  name="pricetag-outline" 
                  size={14} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.tags, { color: theme.colors.onSurfaceVariant }]}>
                  {task.tags.length} tag{task.tags.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
            
            {task.checklist && task.checklist.length > 0 ? (
              <View style={styles.checklistContainer}>
                <Ionicons 
                  name="list-outline" 
                  size={14} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.checklist, { color: theme.colors.onSurfaceVariant }]}>
                  {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        
        {task.isEveningTask && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name="moon-outline" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
          </View>
        )}
        
        <View style={styles.chevronContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.colors.onSurfaceVariant} 
          />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  notes: {
    fontSize: 14,
    marginTop: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  tags: {
    fontSize: 12,
    marginLeft: 4,
  },
  checklistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklist: {
    fontSize: 12,
    marginLeft: 4,
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginRight: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderRadius: 8,
    marginLeft: 8,
  },
});

export default TaskItem; 