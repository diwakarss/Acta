import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Text, useTheme, FAB, Modal, Portal, Card, IconButton, Button, TextInput, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import useTaskStore from '../../src/store/taskStore';
import { Project, Heading } from '../../src/store/taskStore';

export default function ProjectsScreen() {
  const theme = useTheme();
  const projects = useTaskStore(state => state.projects);
  const areas = useTaskStore(state => state.areas);
  const addProject = useTaskStore(state => state.addProject);
  const updateProject = useTaskStore(state => state.updateProject);
  const deleteProject = useTaskStore(state => state.deleteProject);
  const getTasksByProject = useTaskStore(state => state.getTasksByProject);
  
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectColor, setProjectColor] = useState('#0a7ea4');
  const [projectIcon, setProjectIcon] = useState('folder');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  
  // Available colors for projects
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
  
  // Available icons for projects
  const icons = [
    'folder',
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
  
  // Load projects when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // No need to load projects as they're already available from the store
      return () => {};
    }, [])
  );
  
  // Handle project press
  const handleProjectPress = (project: Project) => {
    // TODO: Navigate to project detail screen
    console.log('Project pressed:', project.name);
  };
  
  // Handle add project button press
  const handleAddProject = () => {
    setSelectedProject(null);
    setProjectName('');
    setProjectDescription('');
    setProjectColor(colors[0]);
    setProjectIcon(icons[0]);
    setSelectedAreaId(null);
    setIsAddProjectModalVisible(true);
  };
  
  // Handle edit project
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description);
    setProjectColor(project.color);
    setProjectIcon(project.icon);
    setSelectedAreaId(project.areaId);
    setIsAddProjectModalVisible(true);
  };
  
  // Handle project form save
  const handleProjectFormSave = () => {
    if (!projectName.trim()) {
      // Show error for empty name
      return;
    }
    
    const projectData = {
      name: projectName.trim(),
      description: projectDescription.trim(),
      color: projectColor,
      icon: projectIcon,
      areaId: selectedAreaId,
      dueDate: null,
    };
    
    if (selectedProject) {
      // Update existing project
      updateProject(selectedProject.id, projectData);
    } else {
      // Add new project
      addProject(projectData);
    }
    
    setIsAddProjectModalVisible(false);
  };
  
  // Handle project form cancel
  const handleProjectFormCancel = () => {
    setIsAddProjectModalVisible(false);
  };
  
  // Handle project deletion
  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };
  
  // Render project card
  const renderProjectCard = ({ item }: { item: Project }) => {
    const taskCount = getTasksByProject(item.id).length;
    const projectArea = areas.find(area => area.id === item.areaId);
    
    return (
      <Card style={styles.projectCard} onPress={() => handleProjectPress(item)}>
        <Card.Content>
          <View style={styles.projectHeader}>
            <View style={[styles.projectIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color="white" />
            </View>
            
            <View style={styles.projectInfo}>
              <Text style={styles.projectName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.projectDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            
            <View style={styles.projectActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditProject(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteProject(item.id)}
              />
            </View>
          </View>
          
          <View style={styles.projectMeta}>
            <Chip icon="checkbox-marked" style={styles.metaChip}>
              {taskCount} task{taskCount !== 1 ? 's' : ''}
            </Chip>
            
            {projectArea && (
              <Chip 
                icon={() => (
                  <View style={[styles.areaIcon, { backgroundColor: projectArea.color }]}>
                    <Ionicons name={projectArea.icon as any} size={16} color="white" />
                  </View>
                )}
                style={styles.metaChip}
              >
                {projectArea.name}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.header, { color: theme.colors.onBackground }]}>Projects</Text>
        
        {projects.length > 0 ? (
          <FlatList
            data={projects}
            renderItem={renderProjectCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.projectList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              No projects yet
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddProject}
              style={styles.addButton}
              icon="plus"
            >
              Add Project
            </Button>
          </View>
        )}
      </View>
      
      {/* Add Project FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddProject}
      />
      
      {/* Add/Edit Project Modal */}
      <Portal>
        <Modal
          visible={isAddProjectModalVisible}
          onDismiss={handleProjectFormCancel}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <ScrollView style={styles.formScrollView}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {selectedProject ? 'Edit Project' : 'New Project'}
              </Text>
              
              {/* Project Name */}
              <TextInput
                label="Project Name"
                value={projectName}
                onChangeText={setProjectName}
                style={styles.input}
                mode="outlined"
              />
              
              {/* Project Description */}
              <TextInput
                label="Description"
                value={projectDescription}
                onChangeText={setProjectDescription}
                style={styles.input}
                multiline
                numberOfLines={3}
                mode="outlined"
              />
              
              {/* Project Color */}
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorContainer}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      projectColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setProjectColor(color)}
                  />
                ))}
              </View>
              
              {/* Project Icon */}
              <Text style={styles.sectionTitle}>Icon</Text>
              <View style={styles.iconContainer}>
                {icons.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      projectIcon === icon && [styles.selectedIconOption, { borderColor: projectColor }]
                    ]}
                    onPress={() => setProjectIcon(icon)}
                  >
                    <Ionicons 
                      name={icon as any} 
                      size={24} 
                      color={projectIcon === icon ? projectColor : theme.colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Project Area */}
              <Text style={styles.sectionTitle}>Area</Text>
              <View style={styles.areaContainer}>
                {areas.map(area => (
                  <Chip
                    key={area.id}
                    selected={selectedAreaId === area.id}
                    onPress={() => setSelectedAreaId(area.id)}
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
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleProjectFormCancel} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleProjectFormSave} style={styles.button}>
              {selectedProject ? 'Update' : 'Create'}
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
  projectList: {
    paddingBottom: 80,
  },
  projectCard: {
    marginBottom: 12,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  projectActions: {
    flexDirection: 'row',
  },
  projectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  areaIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  areaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  areaChip: {
    marginRight: 8,
    marginBottom: 8,
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