# Code Reorganization Plan for Acta Project

## Current Issues

From the files we've examined, we see several opportunities for improvement:

1. **Inconsistent Component Organization**: Components are mixed in both root `/components` directory and `/src/components` without clear categorization.

2. **Lack of Feature-Based Organization**: Code is organized by type (components, hooks, utils) rather than by feature.

3. **Unclear Dependency Paths**: Import paths vary between relative paths and alias paths (`@/`).

4. **Mixed Web and Native Code**: Platform-specific code is often mixed within the same files with conditional rendering.

## Proposed Directory Structure

```
/src
  /components
    /ui           # Reusable UI components
      Button.tsx
      Card.tsx
      ...
    /layout       # Layout components
      Header.tsx
      TabBar.tsx
      ...
    /features     # Feature-specific components organized by feature
      /tasks
        TaskList.tsx
        TaskItem.tsx
        ...
      /auth
        LoginForm.tsx
        SignupForm.tsx
        ...
      /settings
        ThemeSettings.tsx
        NotificationSettings.tsx
        ...
      /sync
        SyncStatusIndicator.tsx
        ...
  /hooks          # Custom React hooks
    /ui           # UI-related hooks
      useTheme.ts
      ...
    /data         # Data-related hooks
      useSyncStatus.ts
      ...
    /auth         # Authentication hooks
      useAuth.ts
      ...
  /store          # State management
    taskStore.ts
    themeStore.ts
    ...
  /utils          # Utility functions
    /api          # API-related utilities
      firebase.ts
      cloudSync.ts
      ...
    /formatting   # Formatting utilities
      dateFormat.ts
      ...
    /platform     # Platform-specific utilities
      webStyles.ts
      ...
  /types          # TypeScript type definitions
    index.ts
    tasks.ts
    ...
  /constants      # Constants and configuration
    theme.ts
    routes.ts
    ...
/app              # Expo Router app directory
  /(tabs)         # Tab navigation screens
  /auth           # Authentication screens
  /settings       # Settings screens
  ...
/assets           # Static assets
  /fonts
  /images
  ...
```

## Implementation Strategy

To ensure the app remains functional during reorganization:

1. **Phased Approach**: Implement changes in small, testable batches
2. **Test After Each Phase**: Verify app functionality after each change
3. **Maintain Backward Compatibility**: Use barrel files (index.ts) to maintain existing import paths initially

## Phase 1: Create New Directory Structure

1. Create the new directory structure
2. Add placeholder index.ts files to maintain imports
3. Test that the app still builds and runs

## Phase 2: Reorganize Components

1. Move UI components to `/src/components/ui`
2. Move layout components to `/src/components/layout`
3. Create feature directories and move components into them
4. Update imports using barrel files
5. Test each change

## Phase 3: Reorganize Hooks and Utils

1. Categorize hooks into their respective directories
2. Reorganize utilities by function
3. Update imports
4. Test functionality

## Phase 4: Update Import Paths

1. Standardize on `@/` import paths
2. Update tsconfig.json path aliases
3. Fix any broken imports
4. Test thoroughly

## Phase 5: Documentation and Cleanup

1. Add README files to each directory explaining its purpose
2. Remove unused code and files
3. Update comments
4. Final testing

## Best Practices to Enforce

1. **File Naming**: Use PascalCase for components, camelCase for utilities
2. **Import Order**: Group imports by external, internal, relative
3. **Component Structure**: Consistent structure for component files
4. **Platform-Specific Code**: Use platform-specific files rather than conditionals where possible

## Expected Outcomes

1. **Improved Developer Experience**: Easier navigation of the codebase
2. **Better Maintainability**: Clearer organization makes future changes easier
3. **Enhanced Scalability**: Structure supports adding new features without confusion
4. **Reduced Coupling**: Better separation of concerns 