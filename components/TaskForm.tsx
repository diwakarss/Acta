import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  TextInput, 
  Button, 
  useTheme, 
  Text, 
  Chip, 
  IconButton, 
  Divider,
  Switch
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Task, ChecklistItem, Tag } from '../src/store/taskStore';
import useTaskStore from '../src/store/taskStore';
import useNotificationStore from '../src/store/notificationStore';

type TaskFormProps = {
  task?: Task;
  onSave: () => void;
  onCancel: () => void;
};

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const theme = useTheme();
  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const tags = useTaskStore(state => state.tags);
  const projects = useTaskStore(state => state.projects);
  const areas = useTaskStore(state => state.areas);
  const addReminder = useNotificationStore(state => state.addReminder);
  
  // Form state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEveningTask, setIsEveningTask] = useState(false);
  const [isSomedayTask, setIsSomedayTask] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [repeatOption, setRepeatOption] = useState<Task['repeatOption']>('none');
  
  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes);
      setChecklist(task.checklist);
      setSelectedTags(task.tags);
      setSelectedProject(task.projectId);
      setSelectedArea(task.areaId);
      setIsEveningTask(task.isEveningTask);
      setIsSomedayTask(task.isSomedayTask);
      setRepeatOption(task.repeatOption);
      
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate));
      }
      
      if (task.dueTime) {
        setDueTime(new Date(task.dueTime));
      }
      
      if (task.reminder) {
        setHasReminder(true);
        setReminderTime(new Date(task.reminder));
      }
    }
  }, [task]);
  
  // Handle adding a checklist item
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false
      };
      
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };
  
  // Handle removing a checklist item
  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };
  
  // Handle toggling a checklist item
  const handleToggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map(item => 
        item.id === id 
          ? { ...item, completed: !item.completed } 
          : item
      )
    );
  };
  
  // Handle date picker changes
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Handle time picker changes
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };
  
  // Handle reminder time picker changes
  const handleReminderChange = (event: any, selectedTime?: Date) => {
    setShowReminderPicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };
  
  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      // Show error for empty title
      return;
    }
    
    const taskData = {
      title: title.trim(),
      notes: notes.trim(),
      checklist,
      completed: false,
      dueDate: dueDate ? dueDate.toISOString() : null,
      dueTime: dueTime ? dueTime.toISOString() : null,
      reminder: reminderTime ? reminderTime.toISOString() : null,
      repeatOption,
      tags: selectedTags,
      projectId: selectedProject,
      areaId: selectedArea,
      isEveningTask,
      isSomedayTask
    };
    
    if (task) {
      // Update existing task
      updateTask(task.id, taskData);
    } else {
      // Add new task
      addTask(taskData as any);
    }
    
    // Handle reminder if needed
    if (hasReminder && reminderTime) {
      if (task) {
        // TODO: Update reminder
      } else {
        // Schedule a new reminder
        const taskId = task ? task.id : 'new-task'; // This will be replaced with the actual ID
        await addReminder(taskId, reminderTime.toISOString(), repeatOption);
      }
    }
    
    onSave();
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Title Input */}
          <TextInput
            label="Task Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />
          
          {/* Notes Input */}
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
            multiline
            numberOfLines={4}
            mode="outlined"
          />
          
          {/* Checklist */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            
            {checklist.map(item => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleChecklistItem(item.id)}
                >
                  <Ionicons
                    name={item.completed ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <Text style={[
                  styles.checklistText,
                  item.completed && styles.completedText
                ]}>
                  {item.text}
                </Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => handleRemoveChecklistItem(item.id)}
                />
              </View>
            ))}
            
            <View style={styles.addChecklistItem}>
              <TextInput
                label="Add Item"
                value={newChecklistItem}
                onChangeText={setNewChecklistItem}
                style={styles.checklistInput}
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon="plus"
                    onPress={handleAddChecklistItem}
                  />
                }
                onSubmitEditing={handleAddChecklistItem}
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Due Date & Time */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Due Date & Time</Text>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.dateTimeText}>
                  {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Set Date'}
                </Text>
              </TouchableOpacity>
              
              {dueDate && (
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.dateTimeText}>
                    {dueTime ? format(dueTime, 'h:mm a') : 'Set Time'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            {/* Evening Task Toggle */}
            <View style={styles.switchContainer}>
              <Text>Evening Task</Text>
              <Switch
                value={isEveningTask}
                onValueChange={setIsEveningTask}
                color={theme.colors.primary}
              />
            </View>
            
            {/* Someday Task Toggle */}
            <View style={styles.switchContainer}>
              <Text>Someday Task</Text>
              <Switch
                value={isSomedayTask}
                onValueChange={setIsSomedayTask}
                color={theme.colors.primary}
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Reminder */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            
            <View style={styles.switchContainer}>
              <Text>Set Reminder</Text>
              <Switch
                value={hasReminder}
                onValueChange={setHasReminder}
                color={theme.colors.primary}
              />
            </View>
            
            {hasReminder && (
              <>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowReminderPicker(true)}
                >
                  <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.dateTimeText}>
                    {reminderTime ? format(reminderTime, 'MMM d, yyyy h:mm a') : 'Set Reminder Time'}
                  </Text>
                </TouchableOpacity>
                
                {showReminderPicker && (
                  <DateTimePicker
                    value={reminderTime || new Date()}
                    mode="datetime"
                    display="default"
                    onChange={handleReminderChange}
                  />
                )}
                
                <View style={styles.repeatContainer}>
                  <Text>Repeat:</Text>
                  <View style={styles.repeatOptions}>
                    {(['none', 'daily', 'weekly', 'monthly'] as const).map(option => (
                      <Chip
                        key={option}
                        selected={repeatOption === option}
                        onPress={() => setRepeatOption(option)}
                        style={styles.repeatChip}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Chip>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Tags */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tags</Text>
            
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <Chip
                  key={tag.id}
                  selected={selectedTags.includes(tag.id)}
                  onPress={() => handleTagToggle(tag.id)}
                  style={[styles.tagChip, { backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }]}
                >
                  {tag.name}
                </Chip>
              ))}
              
              {tags.length === 0 && (
                <Text style={styles.emptyText}>No tags created yet</Text>
              )}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Project & Area */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Project</Text>
            
            <View style={styles.projectsContainer}>
              {projects.map(project => (
                <Chip
                  key={project.id}
                  selected={selectedProject === project.id}
                  onPress={() => setSelectedProject(project.id)}
                  style={styles.projectChip}
                  icon={() => (
                    <View style={[styles.projectIcon, { backgroundColor: project.color }]}>
                      <Ionicons name={project.icon as any} size={16} color="white" />
                    </View>
                  )}
                >
                  {project.name}
                </Chip>
              ))}
              
              {projects.length === 0 && (
                <Text style={styles.emptyText}>No projects created yet</Text>
              )}
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Area</Text>
            
            <View style={styles.areasContainer}>
              {areas.map(area => (
                <Chip
                  key={area.id}
                  selected={selectedArea === area.id}
                  onPress={() => setSelectedArea(area.id)}
                  style={styles.areaChip}
                  icon={() => (
                    <View style={[styles.areaIcon, { backgroundColor: area.color }]}>
                      <Ionicons name={area.icon as any} size={16} color="white" />
                    </View>
                  )}
                >
                  {area.name}
                </Chip>
              ))}
              
              {areas.length === 0 && (
                <Text style={styles.emptyText}>No areas created yet</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancel
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          {task ? 'Update' : 'Create'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  checklistText: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  addChecklistItem: {
    marginTop: 8,
  },
  checklistInput: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  dateTimeText: {
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  repeatContainer: {
    marginTop: 12,
  },
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  repeatChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  projectChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  projectIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  areaIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default TaskForm; 