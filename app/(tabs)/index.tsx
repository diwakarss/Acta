import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';

// This component will redirect to the 'today' tab which is our main dashboard
export default function IndexScreen() {
  // Option 1: Use Redirect component for immediate redirection
  return <Redirect href="/(tabs)/today" />;
  
  // Option 2: Alternative approach using useEffect if Redirect doesn't work
  // useEffect(() => {
  //   router.replace({pathname: '/(tabs)/today'});
  // }, []);
  
  // // Show loading indicator while redirecting
  // return (
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //     <ActivityIndicator size="large" />
  //   </View>
  // );
}
