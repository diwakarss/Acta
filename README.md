# Acta - Task Management App

A powerful and intuitive task management application built with React Native, focusing on robust functionality and seamless user experience.

## Features

- Task management with checklists and reminders
- Project and area organization
- Today, Evening, Upcoming, Anytime, and Someday views
- Calendar integration
- Email to task conversion
- Siri shortcuts and voice commands
- Markdown support for task notes
- Customizable widgets
- Cloud synchronization for real-time updates across devices

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/acta.git
   cd acta
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to a new file named `.env`
   - Fill in your API keys and other configuration values
   ```
   cp .env.example .env
   ```

### Environment Variables

This app uses several environment variables to configure external services. Create a `.env` file in the project root with the following variables:

```
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Google Calendar API
EXPO_PUBLIC_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key_here
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_here

# AWS SES Configuration (for Email-to-Task feature)
EXPO_PUBLIC_AWS_SES_REGION=us-east-1
EXPO_PUBLIC_AWS_SES_ACCESS_KEY=your_aws_access_key_here
EXPO_PUBLIC_AWS_SES_SECRET_KEY=your_aws_secret_key_here

# Note: Push notifications use Firebase Cloud Messaging API (V1)
# which does not require a server key. Configuration is handled through
# Firebase project settings and expo-notifications.
```

### Setting up Firebase

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add a Web App to your Firebase project
3. Enable Authentication with Email/Password and Google Sign-In
4. Create a Firestore database
5. For Cloud Messaging (Push Notifications):
   - Go to Project Settings > Cloud Messaging
   - Make sure Firebase Cloud Messaging API (V1) is enabled
   - For web push, generate a Web Push certificate
6. Copy the Firebase configuration values to your `.env` file

### Running the App

Start the development server:

```
npx expo start
```

This will open Expo DevTools in your browser. You can run the app on:
- An iOS simulator
- An Android emulator
- Your physical device using the Expo Go app

## Project Structure

```
acta/
├── app/                 # Expo Router screens and components
├── assets/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env                 # Environment variables (not in git)
└── app.config.js        # Expo configuration
```

## Code Organization

The Acta codebase is organized in a structured way to improve maintainability and developer experience:

### Directory Structure

- `/src` - Main source code directory
  - `/components` - React components
    - `/ui` - Reusable UI components
    - `/layout` - Layout components
    - `/features` - Feature-specific components
  - `/hooks` - React hooks
    - `/ui` - UI-related hooks
    - `/data` - Data management hooks
    - `/auth` - Authentication hooks
  - `/store` - State management
  - `/utils` - Utility functions
    - `/api` - API interaction utilities
    - `/platform` - Platform-specific utilities
    - `/formatting` - Data formatting utilities
  - `/constants` - Application constants
  - `/types` - TypeScript type definitions
- `/app` - Expo Router app directory
- `/assets` - Static assets

### Import Conventions

Use alias imports with `@/` prefix:

```tsx
// Good
import { Button } from '@/src/components/ui';
import { ROUTES } from '@/src/constants';

// Avoid
import { Button } from '../../../components/ui';
```

### Component Organization

Components are organized by their purpose:

1. **UI Components**: Reusable UI elements with no business logic
2. **Layout Components**: Structural components for layout
3. **Feature Components**: Components specific to a feature or domain

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Things 3 and other task management apps
- Built with Expo and React Native
