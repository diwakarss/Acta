# Acta - Task Management App

Acta is a powerful task management application built with React Native and Expo. It helps you organize your tasks, projects, and areas of responsibility in an intuitive and efficient way.

## Features

- **Task Management**: Create, edit, and delete tasks with titles, notes, checklists, and more.
- **Deadlines and Reminders**: Set due dates and get reminders for your tasks.
- **Tags**: Organize tasks with custom tags for easy filtering.
- **Projects and Areas**: Group tasks under projects and organize projects into areas.
- **Scheduling**: View tasks for today, upcoming days, or anytime.
- **Dark Mode**: Switch between light and dark themes.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI

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

3. Start the development server:
   ```
   npm start
   ```

4. Open the app on your device using the Expo Go app or run it in a simulator.

## Project Structure

- `app/`: Expo Router app directory
  - `(tabs)/`: Tab navigation screens
- `src/`: Source code
  - `components/`: Reusable UI components
  - `store/`: Zustand state management
  - `theme/`: App theming
  - `screens/`: Screen components
  - `navigation/`: Navigation configuration
  - `hooks/`: Custom React hooks
  - `utils/`: Utility functions

## Technologies Used

- React Native
- Expo
- Zustand (State Management)
- React Navigation
- React Native Paper (UI Components)
- AsyncStorage (Local Storage)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Things 3 and other task management apps
- Built with Expo and React Native
