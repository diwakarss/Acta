import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/src/components/AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const { signIn, signUp, signInWithGoogle, user, isLoading } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (user && !isLoading) {
      console.log('User authenticated, redirecting to home');
      router.replace('/');
    }

    // Pre-fill email if we have one in AsyncStorage
    AsyncStorage.getItem('lastUserEmail').then(storedEmail => {
      if (storedEmail) {
        setEmail(storedEmail);
      }
    });
  }, [user, isLoading]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`Attempting to ${isLogin ? 'sign in' : 'sign up'} with email: ${email}`);
      
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Show success message for sign up
        Alert.alert(
          'Account Created', 
          'Your account has been created successfully! You can now sign in.',
          [{ text: 'OK' }]
        );
        // Switch to login view
        setIsLogin(true);
      }
    } catch (error) {
      // Error handling is done in the AuthProvider, but we can add UI-specific handling here
      console.error('Authentication error in login screen:', error);
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

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    if (isGoogleSigningIn) return;
    
    setIsGoogleSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error during Google sign in:', error);
      // Error handling is done in the AuthProvider
    } finally {
      setIsGoogleSigningIn(false);
    }
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
          disabled={isSubmitting || isGoogleSigningIn}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
        
        <Button 
          mode="text" 
          onPress={toggleMode}
          style={styles.toggleButton}
          disabled={isSubmitting || isGoogleSigningIn}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>
        
        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <Divider style={styles.divider} />
        </View>
        
        <Button
          mode="outlined"
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="google" size={size} color="#4285F4" />
          )}
          onPress={handleGoogleSignIn}
          loading={isGoogleSigningIn}
          disabled={isSubmitting || isGoogleSigningIn}
          style={[styles.googleButton, { backgroundColor: 'white' }]}
          labelStyle={{ color: '#757575' }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Sign in with Google
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16, 
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.7,
  },
  googleButton: {
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