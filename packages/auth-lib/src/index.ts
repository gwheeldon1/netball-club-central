// Export authentication and authorization functionality

// Context and providers
export * from './context/AuthContext';
export * from './providers/AuthProvider';

// Hooks
export * from './hooks/useAuth';
export * from './hooks/useRoles';
export * from './hooks/usePermissions';

// Components
export * from './components/ProtectedRoute';
export * from './components/RoleGuard';
export * from './components/LoginForm';

// Services
export * from './services/authService';
export * from './services/roleService';
export * from './services/permissionService';

// Utilities
export * from './utils/tokenManagement';
export * from './utils/roleValidation';
export * from './utils/permissionCheck';

// Types (re-export from shared-types)
export type { User, Role, Permission, Session } from '@netball/shared-types';