import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import useEmailStore from '../../src/store/emailStore';
import useTaskStore from '../../src/store/taskStore';

// Define the EmailToTaskRule interface
interface EmailToTaskRule {
  id: string;
  name: string;
  isEnabled: boolean;
  fromAddresses: string[];
  subjectContains: string[];
  bodyContains: string[];
  assignToProject: string | null;
  assignToArea: string | null;
  addTags: string[];
  isEveningTask: boolean;
  isSomedayTask: boolean;
}

export default function EmailSettingsScreen() {
  const { 
    settings, 
    rules, 
    updateForwardingAddress, 
    toggleEmailToTask, 
    addRule, 
    updateRule, 
    deleteRule,
    initializeState 
  } = useEmailStore();
  
  const { projects, areas, tags } = useTaskStore();
  
  const [forwardingAddress, setForwardingAddress] = useState(settings.forwardingAddress);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Omit<EmailToTaskRule, 'id'>>({
    name: '',
    isEnabled: true,
    fromAddresses: [],
    subjectContains: [],
    bodyContains: [],
    assignToProject: null,
    assignToArea: null,
    addTags: [],
    isEveningTask: false,
    isSomedayTask: false,
  });
  
  useEffect(() => {
    initializeState();
  }, []);
  
  const handleSaveForwardingAddress = () => {
    updateForwardingAddress(forwardingAddress);
    Alert.alert('Success', 'Forwarding address updated');
  };
  
  const handleAddRule = () => {
    if (!newRule.name) {
      Alert.alert('Error', 'Please provide a name for the rule');
      return;
    }
    
    addRule(newRule);
    setNewRule({
      name: '',
      isEnabled: true,
      fromAddresses: [],
      subjectContains: [],
      bodyContains: [],
      assignToProject: null,
      assignToArea: null,
      addTags: [],
      isEveningTask: false,
      isSomedayTask: false,
    });
    Alert.alert('Success', 'Rule added successfully');
  };
  
  const handleUpdateRule = (id: string, updates: Partial<Omit<EmailToTaskRule, 'id'>>) => {
    updateRule(id, updates);
  };
  
  const handleDeleteRule = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteRule(id);
            setSelectedRuleId(null);
          }
        }
      ]
    );
  };
  
  const renderRuleItem = (rule: EmailToTaskRule) => {
    const isSelected = selectedRuleId === rule.id;
    
    return (
      <View key={rule.id} style={styles.ruleContainer}>
        <TouchableOpacity 
          style={styles.ruleHeader}
          onPress={() => setSelectedRuleId(isSelected ? null : rule.id)}
        >
          <View style={styles.ruleHeaderLeft}>
            <Switch
              value={rule.isEnabled}
              onValueChange={(value) => handleUpdateRule(rule.id, { isEnabled: value })}
            />
            <Text style={styles.ruleName}>{rule.name}</Text>
          </View>
          <Ionicons 
            name={isSelected ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
        
        {isSelected && (
          <View style={styles.ruleDetails}>
            <Text style={styles.sectionTitle}>From Addresses</Text>
            <View style={styles.tagsContainer}>
              {rule.fromAddresses.map((address: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{address}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newAddresses = [...rule.fromAddresses];
                      newAddresses.splice(index, 1);
                      handleUpdateRule(rule.id, { fromAddresses: newAddresses });
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Alert.prompt(
                    'Add Email Address',
                    'Enter an email address to match',
                    (text) => {
                      if (text) {
                        handleUpdateRule(rule.id, { 
                          fromAddresses: [...rule.fromAddresses, text] 
                        });
                      }
                    }
                  );
                }}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Subject Contains</Text>
            <View style={styles.tagsContainer}>
              {rule.subjectContains.map((text: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{text}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newTexts = [...rule.subjectContains];
                      newTexts.splice(index, 1);
                      handleUpdateRule(rule.id, { subjectContains: newTexts });
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Alert.prompt(
                    'Add Subject Text',
                    'Enter text to match in the subject',
                    (text) => {
                      if (text) {
                        handleUpdateRule(rule.id, { 
                          subjectContains: [...rule.subjectContains, text] 
                        });
                      }
                    }
                  );
                }}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Body Contains</Text>
            <View style={styles.tagsContainer}>
              {rule.bodyContains.map((text: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{text}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newTexts = [...rule.bodyContains];
                      newTexts.splice(index, 1);
                      handleUpdateRule(rule.id, { bodyContains: newTexts });
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Alert.prompt(
                    'Add Body Text',
                    'Enter text to match in the body',
                    (text) => {
                      if (text) {
                        handleUpdateRule(rule.id, { 
                          bodyContains: [...rule.bodyContains, text] 
                        });
                      }
                    }
                  );
                }}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Assign To</Text>
            <View style={styles.assignContainer}>
              <View style={styles.assignItem}>
                <Text style={styles.assignLabel}>Project:</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    // Show project picker
                    Alert.alert(
                      'Select Project',
                      'Choose a project or none',
                      [
                        { text: 'None', onPress: () => handleUpdateRule(rule.id, { assignToProject: null }) },
                        ...projects.map(project => ({
                          text: project.name,
                          onPress: () => handleUpdateRule(rule.id, { assignToProject: project.id })
                        }))
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    {rule.assignToProject 
                      ? projects.find(p => p.id === rule.assignToProject)?.name || 'Select' 
                      : 'None'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.assignItem}>
                <Text style={styles.assignLabel}>Area:</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    // Show area picker
                    Alert.alert(
                      'Select Area',
                      'Choose an area or none',
                      [
                        { text: 'None', onPress: () => handleUpdateRule(rule.id, { assignToArea: null }) },
                        ...areas.map(area => ({
                          text: area.name,
                          onPress: () => handleUpdateRule(rule.id, { assignToArea: area.id })
                        }))
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    {rule.assignToArea 
                      ? areas.find(a => a.id === rule.assignToArea)?.name || 'Select' 
                      : 'None'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {rule.addTags.map((tagId: string, index: number) => {
                const tag = tags.find(t => t.id === tagId);
                return (
                  <View key={index} style={[styles.tag, { backgroundColor: tag?.color || '#ddd' }]}>
                    <Text style={styles.tagText}>{tag?.name || 'Unknown'}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newTags = [...rule.addTags];
                        newTags.splice(index, 1);
                        handleUpdateRule(rule.id, { addTags: newTags });
                      }}
                    >
                      <Ionicons name="close-circle" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  // Show tag picker
                  if (tags.length === 0) {
                    Alert.alert('No Tags', 'Create tags in the settings first');
                    return;
                  }
                  
                  Alert.alert(
                    'Select Tag',
                    'Choose a tag to add',
                    tags
                      .filter(tag => !rule.addTags.includes(tag.id))
                      .map(tag => ({
                        text: tag.name,
                        onPress: () => handleUpdateRule(rule.id, { 
                          addTags: [...rule.addTags, tag.id] 
                        })
                      }))
                  );
                }}
              >
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Task Type</Text>
            <View style={styles.taskTypeContainer}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Evening Task:</Text>
                <Switch
                  value={rule.isEveningTask}
                  onValueChange={(value) => handleUpdateRule(rule.id, { isEveningTask: value })}
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Someday Task:</Text>
                <Switch
                  value={rule.isSomedayTask}
                  onValueChange={(value) => handleUpdateRule(rule.id, { isSomedayTask: value })}
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRule(rule.id)}
            >
              <Text style={styles.deleteButtonText}>Delete Rule</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Email Settings' }} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email to Task</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Email to Task:</Text>
          <Switch
            value={settings.isEmailToTaskEnabled}
            onValueChange={toggleEmailToTask}
          />
        </View>
        
        <Text style={styles.description}>
          Forward emails to your task list by sending them to a specific address.
          Configure rules below to determine how emails are processed.
        </Text>
        
        <Text style={styles.inputLabel}>Forwarding Address:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={forwardingAddress}
            onChangeText={setForwardingAddress}
            placeholder="Enter your forwarding email address"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveForwardingAddress}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email Rules</Text>
        <Text style={styles.description}>
          Create rules to automatically process emails into tasks based on sender, subject, or content.
        </Text>
        
        <View style={styles.newRuleContainer}>
          <Text style={styles.inputLabel}>New Rule:</Text>
          <TextInput
            style={styles.input}
            value={newRule.name}
            onChangeText={(text) => setNewRule({ ...newRule, name: text })}
            placeholder="Enter rule name"
          />
          <TouchableOpacity
            style={styles.addRuleButton}
            onPress={handleAddRule}
          >
            <Text style={styles.addRuleButtonText}>Add Rule</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rulesList}>
          {rules.map(renderRuleItem)}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newRuleContainer: {
    marginBottom: 20,
  },
  addRuleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addRuleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rulesList: {
    marginTop: 10,
  },
  ruleContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  ruleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  ruleDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 5,
    fontSize: 14,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignContainer: {
    marginBottom: 15,
  },
  assignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignLabel: {
    width: 70,
    fontSize: 16,
  },
  selectButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  taskTypeContainer: {
    marginBottom: 15,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 