import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Text, useTheme, FAB, Modal, Portal, Card, IconButton, Button, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import useTaskStore from '../../src/store/taskStore';

// Define interfaces for Area and Project
interface Area {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  areaId: string | null;
  dueDate: string | null;
}

export default function AreasScreen() {
  const theme = useTheme();
  const areas = useTaskStore(state => state.areas);
  const projects = useTaskStore(state => state.projects);
  const addArea = useTaskStore(state => state.addArea);
  const updateArea = useTaskStore(state => state.updateArea);
  const deleteArea = useTaskStore(state => state.deleteArea);
  const getTasksByArea = useTaskStore(state => state.getTasksByArea);
  
  const [isAddAreaModalVisible, setIsAddAreaModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [areaColor, setAreaColor] = useState('#0a7ea4');
  const [areaIcon, setAreaIcon] = useState('grid');
  
  // Available colors for areas
  const colors = [
    '#0a7ea4', // Blue
    '#4ecdc4', // Teal
    '#ff6b6b', // Red
    '#ffe66d', // Yellow
    '#7bc950', // Green
    '#9d65c9', // Purple
    '#f79256', // Orange
    '#6c757d', // Gray
  ];
  
  // Available icons for areas
  const icons = [
    'grid',
    'briefcase',
    'home',
    'book',
    'heart',
    'star',
    'flag',
    'school',
    'fitness',
    'cafe',
    'cart',
    'cash',
    'construct',
    'desktop',
    'film',
    'gift',
    'globe',
    'hammer',
    'headset',
    'leaf',
    'musical-notes',
    'paw',
    'people',
    'pizza',
    'rocket',
    'trophy',
  ];
  
  // Load areas when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // No need to load areas as they're already available from the store
      return () => {};
    }, [])
  );
  
  // Handle area press
  const handleAreaPress = (area: Area) => {
    // TODO: Navigate to area detail screen
    console.log('Area pressed:', area.name);
  };
  
  // Handle add area button press
  const handleAddArea = () => {
    setSelectedArea(null);
    setAreaName('');
    setAreaDescription('');
    setAreaColor(colors[0]);
    setAreaIcon(icons[0]);
    setIsAddAreaModalVisible(true);
  };
  
  // Handle edit area
  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setAreaName(area.name);
    setAreaDescription(area.description);
    setAreaColor(area.color);
    setAreaIcon(area.icon);
    setIsAddAreaModalVisible(true);
  };
  
  // Handle area form save
  const handleAreaFormSave = () => {
    if (!areaName.trim()) {
      // Show error for empty name
      return;
    }
    
    const areaData = {
      name: areaName.trim(),
      description: areaDescription.trim(),
      color: areaColor,
      icon: areaIcon,
    };
    
    if (selectedArea) {
      // Update existing area
      updateArea(selectedArea.id, areaData);
    } else {
      // Add new area
      addArea(areaData);
    }
    
    setIsAddAreaModalVisible(false);
  };
  
  // Handle area form cancel
  const handleAreaFormCancel = () => {
    setIsAddAreaModalVisible(false);
  };
  
  // Handle area deletion
  const handleDeleteArea = (areaId: string) => {
    deleteArea(areaId);
  };
  
  // Get projects in area
  const getProjectsInArea = (areaId: string): Project[] => {
    return projects.filter(project => project.areaId === areaId);
  };
  
  // Render area card
  const renderAreaCard = ({ item }: { item: Area }) => {
    const taskCount = getTasksByArea(item.id).length;
    const projectsInArea = getProjectsInArea(item.id);
    
    return (
      <Card style={styles.areaCard} onPress={() => handleAreaPress(item)}>
        <Card.Content>
          <View style={styles.areaHeader}>
            <View style={[styles.areaIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color="white" />
            </View>
            
            <View style={styles.areaInfo}>
              <Text style={styles.areaName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.areaDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            
            <View style={styles.areaActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditArea(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteArea(item.id)}
              />
            </View>
          </View>
          
          <View style={styles.areaMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>
                {projectsInArea.length} project{projectsInArea.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="checkbox-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>
                {taskCount} task{taskCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.header, { color: theme.colors.onBackground }]}>Areas</Text>
        
        {areas.length > 0 ? (
          <FlatList
            data={areas}
            renderItem={renderAreaCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.areaList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No areas yet
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddArea}
              style={styles.addButton}
              icon="plus"
            >
              Add Area
            </Button>
          </View>
        )}
      </View>
      
      {/* Add Area FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddArea}
      />
      
      {/* Add/Edit Area Modal */}
      <Portal>
        <Modal
          visible={isAddAreaModalVisible}
          onDismiss={handleAreaFormCancel}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <ScrollView style={styles.formScrollView}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {selectedArea ? 'Edit Area' : 'New Area'}
              </Text>
              
              {/* Area Name */}
              <TextInput
                label="Area Name"
                value={areaName}
                onChangeText={setAreaName}
                style={styles.input}
                mode="outlined"
              />
              
              {/* Area Description */}
              <TextInput
                label="Description"
                value={areaDescription}
                onChangeText={setAreaDescription}
                style={styles.input}
                multiline
                numberOfLines={3}
                mode="outlined"
              />
              
              {/* Area Color */}
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorContainer}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      areaColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setAreaColor(color)}
                  />
                ))}
              </View>
              
              {/* Area Icon */}
              <Text style={styles.sectionTitle}>Icon</Text>
              <View style={styles.iconContainer}>
                {icons.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      areaIcon === icon && [styles.selectedIconOption, { borderColor: areaColor }]
                    ]}
                    onPress={() => setAreaIcon(icon)}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={24} 
                      color={areaIcon === icon ? areaColor : theme.colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleAreaFormCancel} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAreaFormSave} style={styles.button}>
              {selectedArea ? 'Update' : 'Create'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  areaList: {
    paddingBottom: 80,
  },
  areaCard: {
    marginBottom: 12,
    elevation: 2,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  areaDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  areaActions: {
    flexDirection: 'row',
  },
  areaMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.7,
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
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: 'white',
  },
  iconContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderWidth: 2,
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