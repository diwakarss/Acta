import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, List, Avatar, Divider, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useAuth } from '@/src/components/AuthProvider';
import cloudSync from '@/src/utils/cloudSync';

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your data will still be available when you sign back in.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace({pathname: '/auth/login'});
            } catch (error) {
              console.error('Error signing out:', error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      // Trigger a manual sync of all data
      Alert.alert(
        "Sync in Progress",
        "Synchronizing your data with cloud storage...",
        [{ text: "OK" }]
      );
      
      // You could add more comprehensive sync here
      // This is a placeholder for demonstration
      setTimeout(() => {
        Alert.alert(
          "Sync Complete",
          "Your data has been successfully synchronized with cloud storage.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error syncing data:', error);
      Alert.alert(
        "Sync Error",
        "There was a problem synchronizing your data. Please try again later.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.profileContainer}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {user?.displayName || 'Acta User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.userId}>Account ID: {user?.uid?.substring(0, 10)}...</Text>
        </View>
      </Surface>

      <List.Section>
        <List.Subheader>Account Details</List.Subheader>
        
        <List.Item 
          title="Email Verification"
          description={user?.emailVerified ? "Verified" : "Not verified"}
          left={props => <List.Icon {...props} icon={user?.emailVerified ? "check-circle" : "alert-circle"} />}
          right={props => !user?.emailVerified && (
            <Button mode="text" onPress={() => Alert.alert("Verification", "A verification email would be sent here.")}>
              Verify
            </Button>
          )}
        />
        
        <Divider />

        <List.Item 
          title="Account Created"
          description={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
          left={props => <List.Icon {...props} icon="calendar" />}
        />
        
        <Divider />
        
        <List.Item 
          title="Last Sign In"
          description={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
          left={props => <List.Icon {...props} icon="login" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        
        <List.Item 
          title="Sync Data"
          description="Manually sync your data with the cloud"
          left={props => <List.Icon {...props} icon="cloud-sync" />}
          onPress={handleSyncData}
        />
        
        <Divider />
        
        <List.Item 
          title="Export Data"
          description="Export your data as a JSON file"
          left={props => <List.Icon {...props} icon="export" />}
          onPress={() => Alert.alert("Export", "This would export your data as a file.")}
        />
        
        <Divider />
        
        <List.Item 
          title="Delete Account"
          description="Permanently delete your account and all data"
          left={props => <List.Icon {...props} icon="delete" color="red" />}
          onPress={() => Alert.alert(
            "Delete Account", 
            "This action cannot be undone. Are you sure you want to delete your account?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive" }
            ]
          )}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleSignOut}
          loading={isLoading}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 20,
    marginBottom: 20,
  },
  signOutButton: {
    paddingVertical: 8,
  },
}); 