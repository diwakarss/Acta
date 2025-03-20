// Import any testing libraries that need to be configured
import '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
  Stack: {
    Screen: 'Stack.Screen',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  Constants: {
    expoConfig: {
      extra: {
        firebaseApiKey: 'mock-api-key',
        firebaseAuthDomain: 'mock-auth-domain',
        firebaseProjectId: 'mock-project-id',
        firebaseStorageBucket: 'mock-storage-bucket',
        firebaseMessagingSenderId: 'mock-sender-id',
        firebaseAppId: 'mock-app-id',
        firebaseMeasurementId: 'mock-measurement-id',
      },
    },
  },
}));

// Mock the DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

// Mock firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-native-paper components
jest.mock('react-native-paper', () => {
  const mockComponent = name => props => JSON.stringify({ type: name, props }, null, 2);
  return {
    Button: mockComponent('Button'),
    TextInput: mockComponent('TextInput'),
    Text: mockComponent('Text'),
    Surface: mockComponent('Surface'),
    useTheme: jest.fn(() => ({
      colors: {
        primary: '#6200ee',
        background: '#f6f6f6',
        surface: '#ffffff',
        error: '#B00020',
        text: '#000000',
        onSurface: '#000000',
        disabled: '#00000088',
        placeholder: '#00000088',
        backdrop: '#00000088',
        notification: '#f50057',
      },
    })),
  };
});

// Global beforeEach to clear all mocks
beforeEach(() => {
  jest.clearAllMocks();
}); 