const path = require('path');
require('dotenv').config();

// Export a function that returns the Expo app configuration
module.exports = ({ config }) => {
  return {
    ...config,
    scheme: 'acta', // Used for deep linking and auth redirects
    extra: {
      // Firebase Configuration
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      
      // Google Sign-In Configuration
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      
      // Google Calendar API
      EXPO_PUBLIC_GOOGLE_CALENDAR_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_CALENDAR_API_KEY,
      EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      
      // AWS SES Configuration
      EXPO_PUBLIC_AWS_SES_REGION: process.env.EXPO_PUBLIC_AWS_SES_REGION,
      EXPO_PUBLIC_AWS_SES_ACCESS_KEY: process.env.EXPO_PUBLIC_AWS_SES_ACCESS_KEY,
      EXPO_PUBLIC_AWS_SES_SECRET_KEY: process.env.EXPO_PUBLIC_AWS_SES_SECRET_KEY,
    },
  };
} 