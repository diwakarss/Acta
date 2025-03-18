// Extending the Expo Router types to include custom route paths
declare module "expo-router" {
  import { ComponentType } from 'react';
  
  // Properly declare the router export
  export const router: {
    push: (href: Href | { pathname: string }) => void;
    replace: (href: Href | { pathname: string }) => void;
    back: () => void;
    navigate: (href: Href | { pathname: string }) => void;
    setParams: (params: any) => void;
    canGoBack: () => boolean;
    dismiss: (count?: number) => void;
  };

  // Properly declare the useRouter hook
  export function useRouter(): typeof router;

  // Properly declare Stack component with Screen subcomponent
  export const Stack: ComponentType<any> & {
    Screen: ComponentType<{
      name: string;
      options?: any;
      initialParams?: Record<string, any>;
    }>
  };
  
  // Properly declare Redirect component
  export const Redirect: ComponentType<{ href: string }>;
  
  // Other component exports
  export const Tabs: ComponentType<any> & {
    Screen: ComponentType<{
      name: string;
      options?: any;
      initialParams?: Record<string, any>;
    }>
  };
  export const Link: ComponentType<any>;

  // Helper hooks
  export const useLocalSearchParams: () => any;
  export const useSegments: () => string[];
  export const usePathname: () => string;

  // Define route types
  export type Href = string | { pathname: string; params?: Record<string, any> };

  export interface RouteNames {
    // Main navigation
    "/(tabs)": undefined;
    "/(tabs)/today": undefined;
    "/(tabs)/upcoming": undefined;
    "/(tabs)/anytime": undefined;
    "/(tabs)/projects": undefined;
    "/(tabs)/areas": undefined;
    
    // Authentication
    "/auth/login": undefined;
    
    // Settings
    "/settings": undefined;
    "/settings/theme": undefined;
    "/settings/notifications": undefined;
    "/settings/widgets": undefined;
    "/settings/calendar": undefined;
    "/settings/email": undefined;
    "/settings/shortcuts": undefined;
    "/settings/about": undefined;
    "/settings/account": undefined;
    
    // Task management
    "/task/new": undefined;
    "/task/[id]": { id: string };
    "/task/edit/[id]": { id: string };
    
    // Project management
    "/project/new": undefined;
    "/project/[id]": { id: string };
    "/project/edit/[id]": { id: string };
    
    // Area management
    "/area/new": undefined;
    "/area/[id]": { id: string };
    "/area/edit/[id]": { id: string };
    
    // Widgets
    "/widgets": undefined;
    "/widgets/add": undefined;
    "/widgets/edit/[id]": { id: string };
    
    // Error
    "+not-found": undefined;
  }
} 