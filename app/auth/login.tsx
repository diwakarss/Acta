import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/src/components/AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, user, isLoading } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (user && !isLoading) {
      router.replace({pathname: '/(tabs)'});
    }

    // Pre-fill email if we have one in AsyncStorage
    AsyncStorage.getItem('lastUserEmail').then(storedEmail => {
      if (storedEmail) {
        setEmail(storedEmail);
      }
    });
  }, [user, isLoading, router]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // Error handling is done in the AuthProvider
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Checking authentication status...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Text style={[styles.title, { color: theme.colors.primary }]}>Acta</Text>
      <Text style={styles.subtitle}>Your Task Management Solution</Text>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye' : 'eye-off'}
              onPress={toggleSecureEntry}
            />
          }
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.button}
          disabled={isSubmitting}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
        
        <Button 
          mode="text" 
          onPress={toggleMode}
          style={styles.toggleButton}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>

        <View style={styles.devLinks}>
          <Text style={styles.devText}>Development Options:</Text>
          <Button 
            mode="text"
            onPress={() => router.push({pathname: '/(tabs)'} as any)}
            style={styles.devButton}
          >
            Skip Login (Dev Only)
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 48,
    opacity: 0.7,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
  toggleButton: {
    marginBottom: 24,
  },
  devLinks: {
    marginTop: 32,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  devText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  devButton: {
    marginVertical: 4,
  },
}); 