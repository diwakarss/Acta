import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';

// Use proper imports with @ path alias
import useWidgetStore from '@/src/store/widgetStore';
import useTaskStore from '@/src/store/taskStore';
// Import types from types directory
import { WidgetType, WidgetSize, Widget } from '@/src/types';

// Predefined colors for widgets
const COLORS = [
  '#007AFF', // Blue
  '#FF9500', // Orange
  '#FF2D55', // Pink
  '#5856D6', // Purple
  '#34C759', // Green
  '#FF3B30', // Red
  '#5AC8FA', // Light Blue
  '#FFCC00', // Yellow
];

// Predefined icons for widgets
const ICONS = [
  { name: 'today', label: 'Today' },
  { name: 'calendar', label: 'Calendar' },
  { name: 'list', label: 'List' },
  { name: 'checkmark-circle', label: 'Checkmark' },
  { name: 'flag', label: 'Flag' },
  { name: 'star', label: 'Star' },
  { name: 'bookmark', label: 'Bookmark' },
  { name: 'folder', label: 'Folder' },
  { name: 'briefcase', label: 'Briefcase' },
  { name: 'home', label: 'Home' },
];

export default function EditWidgetScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const { widgets, updateWidget, removeWidget } = useWidgetStore();
  const { projects, areas, tags } = useTaskStore();
  
  const [widget, setWidget] = useState<Widget | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WidgetType>('today');
  const [entityId, setEntityId] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<WidgetSize>('medium');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0].name);
  
  // Load widget data
  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    
    const foundWidget = widgets.find(w => w.id === id);
    if (!foundWidget) {
      Alert.alert('Error', 'Widget not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    
    setWidget(foundWidget);
    setTitle(foundWidget.title);
    setType(foundWidget.type);
    setEntityId(foundWidget.entityId);
    setSize(foundWidget.size);
    setColor(foundWidget.color);
    setIcon(foundWidget.icon);
  }, [id, widgets]);
  
  // Handle widget update
  const handleUpdateWidget = () => {
    if (!id || !widget) return;
    
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the widget');
      return;
    }
    
    // For project, area, or tag widgets, an entity ID is required
    if (['project', 'area', 'tag'].includes(type) && !entityId) {
      Alert.alert('Error', `Please select a ${type} for the widget`);
      return;
    }
    
    updateWidget(id, {
      title,
      type,
      entityId,
      size,
      color,
      icon,
    });
    
    router.back();
  };
  
  // Handle widget deletion
  const handleDeleteWidget = () => {
    if (!id) return;
    
    Alert.alert(
      'Delete Widget',
      'Are you sure you want to delete this widget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            removeWidget(id);
            router.back();
          }
        }
      ]
    );
  };
  
  // Render entity selection based on widget type
  const renderEntitySelection = () => {
    if (!['project', 'area', 'tag'].includes(type)) {
      return null;
    }
    
    let items: { id: string; name: string; color?: string }[] = [];
    let entityLabel = '';
    
    switch (type) {
      case 'project':
        items = projects;
        entityLabel = 'Project';
        break;
      case 'area':
        items = areas;
        entityLabel = 'Area';
        break;
      case 'tag':
        items = tags;
        entityLabel = 'Tag';
        break;
    }
    
    if (items.length === 0) {
      return (
        <View style={styles.emptyEntityContainer}>
          <Text style={styles.emptyEntityText}>
            No {entityLabel.toLowerCase()}s available. Create some first.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select {entityLabel}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.entityList}
        >
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.entityItem,
                entityId === item.id && styles.selectedEntityItem,
                item.color ? { borderColor: item.color } : null
              ]}
              onPress={() => setEntityId(item.id)}
            >
              <Text 
                style={[
                  styles.entityItemText,
                  entityId === item.id && styles.selectedEntityItemText
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  if (!widget) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading widget...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen name="edit" options={{ title: 'Edit Widget' }} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widget Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter widget title"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widget Type</Text>
        <RadioButton.Group onValueChange={value => {
          setType(value as WidgetType);
          // Reset entityId when changing type
          if (value !== type) {
            setEntityId(undefined);
          }
        }} value={type}>
          <View style={styles.radioOption}>
            <RadioButton value="today" />
            <Text style={styles.radioLabel}>Today's Tasks</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="upcoming" />
            <Text style={styles.radioLabel}>Upcoming Tasks</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="anytime" />
            <Text style={styles.radioLabel}>Anytime Tasks</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="project" />
            <Text style={styles.radioLabel}>Project Tasks</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="area" />
            <Text style={styles.radioLabel}>Area Tasks</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="tag" />
            <Text style={styles.radioLabel}>Tagged Tasks</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      {renderEntitySelection()}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widget Size</Text>
        <RadioButton.Group onValueChange={value => setSize(value as WidgetSize)} value={size}>
          <View style={styles.radioOption}>
            <RadioButton value="small" />
            <Text style={styles.radioLabel}>Small</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="medium" />
            <Text style={styles.radioLabel}>Medium</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="large" />
            <Text style={styles.radioLabel}>Large</Text>
          </View>
        </RadioButton.Group>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widget Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((colorOption, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorItem,
                { backgroundColor: colorOption },
                color === colorOption && styles.selectedColorItem
              ]}
              onPress={() => setColor(colorOption)}
            >
              {color === colorOption && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Widget Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((iconOption, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.iconItem,
                icon === iconOption.name && [styles.selectedIconItem, { borderColor: color }]
              ]}
              onPress={() => setIcon(iconOption.name)}
            >
              <Ionicons 
                name={iconOption.name as any} 
                size={24} 
                color={icon === iconOption.name ? color : '#666'} 
              />
              <Text 
                style={[
                  styles.iconLabel,
                  icon === iconOption.name && { color }
                ]}
              >
                {iconOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.updateButton, { backgroundColor: color }]}
          onPress={handleUpdateWidget}
        >
          <Text style={styles.updateButtonText}>Update Widget</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteWidget}
        >
          <Text style={styles.deleteButtonText}>Delete Widget</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  iconItem: {
    width: '30%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  selectedIconItem: {
    borderWidth: 2,
    backgroundColor: '#f8f8f8',
  },
  iconLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    textAlign: 'center',
  },
  entityList: {
    paddingVertical: 8,
  },
  entityItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedEntityItem: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
  },
  entityItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedEntityItemText: {
    fontWeight: 'bold',
  },
  emptyEntityContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyEntityText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  updateButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 