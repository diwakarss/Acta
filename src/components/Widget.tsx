import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Task } from '../store/taskStore';

type WidgetSize = 'small' | 'medium' | 'large';

interface WidgetProps {
  title: string;
  tasks: Task[];
  size?: WidgetSize;
  color?: string;
  icon?: string;
  onPress?: () => void;
  onTaskPress?: (task: Task) => void;
}

const Widget: React.FC<WidgetProps> = ({
  title,
  tasks,
  size = 'medium',
  color = '#007AFF',
  icon = 'list',
  onPress,
  onTaskPress,
}) => {
  // Determine how many tasks to show based on widget size
  const getTaskLimit = () => {
    switch (size) {
      case 'small': return 1;
      case 'medium': return 3;
      case 'large': return 5;
      default: return 3;
    }
  };
  
  const taskLimit = getTaskLimit();
  const displayTasks = tasks.slice(0, taskLimit);
  const hasMoreTasks = tasks.length > taskLimit;
  
  // Get widget dimensions based on size
  const getWidgetStyle = () => {
    switch (size) {
      case 'small': return styles.smallWidget;
      case 'medium': return styles.mediumWidget;
      case 'large': return styles.largeWidget;
      default: return styles.mediumWidget;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.widget, getWidgetStyle(), { borderColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={18} color="#fff" />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      
      <View style={styles.content}>
        {displayTasks.length > 0 ? (
          <>
            {displayTasks.map((task) => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskItem}
                onPress={() => onTaskPress && onTaskPress(task)}
              >
                <View style={[styles.taskCheckbox, { borderColor: color }]}>
                  {task.completed && (
                    <View style={[styles.taskCheckboxInner, { backgroundColor: color }]} />
                  )}
                </View>
                <Text 
                  style={[
                    styles.taskTitle, 
                    task.completed && styles.completedTaskTitle
                  ]} 
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </TouchableOpacity>
            ))}
            
            {hasMoreTasks && (
              <TouchableOpacity style={styles.moreContainer} onPress={onPress}>
                <Text style={[styles.moreText, { color }]}>
                  +{tasks.length - taskLimit} more
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  smallWidget: {
    width: '47%',
    height: 120,
  },
  mediumWidget: {
    width: '100%',
    height: 150,
  },
  largeWidget: {
    width: '100%',
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  moreContainer: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default Widget; 