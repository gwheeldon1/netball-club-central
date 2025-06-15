# Multi-App Netball Ecosystem - Monorepo Architecture Plan

## Overview
This document outlines the transition from a single netball club management app to a comprehensive multi-app ecosystem using a monorepo structure.

## Target Architecture

### Apps Structure
```
apps/
├── club-manager/          # Current main app (club management)
├── player-portal/         # Individual player app
├── parent-dashboard/      # Parent-specific interface
├── coach-toolkit/         # Coach-specific tools
├── referee-hub/          # Referee management
├── league-admin/         # League-wide administration
└── mobile-companion/     # Mobile-specific app
```

### Packages Structure
```
packages/
├── shared-ui/            # Common UI components
├── shared-types/         # TypeScript types & interfaces
├── shared-utils/         # Utility functions
├── auth-lib/            # Authentication logic
├── api-client/          # API communication layer
├── design-system/       # Design tokens & theme
├── database-schema/     # Supabase schema & migrations
├── notification-service/ # Push notifications
└── analytics/           # Analytics & tracking
```

## Current State Assessment

### Existing Structure
- Single React app with comprehensive functionality
- Well-organized domain-driven structure started
- Robust type system and component library
- Supabase backend integration

### What's Already Shareable
1. **UI Components** (`src/components/ui/`)
2. **Types & Interfaces** (`src/types/`)
3. **Utility Functions** (`src/utils/`)
4. **API Services** (`src/services/`)
5. **Authentication Logic** (`src/context/AuthContext.tsx`)
6. **Design System** (Tailwind config, CSS variables)

## Migration Strategy

### Phase 1: Package Extraction (Current Sprint)
1. Extract shared UI components
2. Create shared types package
3. Extract utility functions
4. Set up design system package

### Phase 2: App Separation
1. Create player-portal app
2. Create parent-dashboard app
3. Migrate shared logic to packages

### Phase 3: Specialized Apps
1. Coach-toolkit app
2. Referee-hub app
3. League-admin app

### Phase 4: Mobile & Advanced Features
1. Mobile-companion app
2. Advanced analytics
3. Real-time features

## Package Definitions

### @netball/shared-ui
**Purpose**: Common UI components used across all apps
**Contents**:
- Button, Input, Card, Modal components
- Layout components (Header, Sidebar)
- Form components
- Loading states & skeletons

**Dependencies**:
- React
- @radix-ui components
- Class Variance Authority

### @netball/shared-types
**Purpose**: TypeScript definitions shared across apps
**Contents**:
- Database types
- API response types
- Component prop interfaces
- Domain models (Team, Player, Event, etc.)

**Dependencies**:
- TypeScript only

### @netball/shared-utils
**Purpose**: Utility functions and helpers
**Contents**:
- Date/time utilities
- Validation functions
- Formatting helpers
- Performance monitoring
- Security utilities

**Dependencies**:
- Date-fns
- Zod (validation)

### @netball/auth-lib
**Purpose**: Authentication and authorization logic
**Contents**:
- Auth context and providers
- Role-based access control
- Session management
- Supabase auth integration

**Dependencies**:
- @supabase/supabase-js
- React Context

### @netball/api-client
**Purpose**: Centralized API communication
**Contents**:
- Supabase client configuration
- API service classes
- Error handling
- Offline capabilities
- Caching strategies

**Dependencies**:
- @supabase/supabase-js
- @tanstack/react-query

### @netball/design-system
**Purpose**: Design tokens, themes, and styling
**Contents**:
- Tailwind configuration
- CSS variables
- Color schemes
- Typography scales
- Component variants

**Dependencies**:
- Tailwind CSS
- CSS variables

## App-Specific Responsibilities

### Club Manager (Current App)
- **Target Users**: Club administrators, managers
- **Core Features**: Team management, event scheduling, user management
- **Unique Features**: Multi-team oversight, financial management, reporting

### Player Portal
- **Target Users**: Individual players
- **Core Features**: Personal stats, upcoming events, team communication
- **Unique Features**: Performance tracking, goal setting, social features

### Parent Dashboard
- **Target Users**: Parents of young players
- **Core Features**: Child's schedule, attendance tracking, communication with coaches
- **Unique Features**: Payment management, permission slips, carpool coordination

### Coach Toolkit
- **Target Users**: Team coaches
- **Core Features**: Training plans, player development, match analysis
- **Unique Features**: Drill library, video analysis, player assessment tools

### Referee Hub
- **Target Users**: Match officials
- **Core Features**: Match assignments, score recording, incident reporting
- **Unique Features**: Rule references, certification tracking, payment tracking

### League Admin
- **Target Users**: League organizers
- **Core Features**: Season management, fixture generation, standings
- **Unique Features**: Registration periods, rule enforcement, statistical reporting

## Implementation Approach

### Immediate Actions (Within Lovable)
1. **Create package structure** in current project
2. **Move shared code** to packages/ directory
3. **Update imports** to use package-style imports
4. **Create package.json** files for each package

### GitHub Integration Strategy
1. **Push current structure** to GitHub
2. **Set up monorepo tooling** (Lerna, Nx, or Turborepo)
3. **Configure workspace** dependencies
4. **Set up CI/CD** for multi-app builds

### Development Workflow
1. **Develop packages** in Lovable
2. **Test integration** in main app
3. **Sync to GitHub** for version management
4. **Deploy apps** independently

## Technology Stack Consistency

### Frontend (All Apps)
- React 18
- TypeScript
- Tailwind CSS
- Vite (build tool)
- Shared design system

### Backend (Shared)
- Supabase (single database)
- Row Level Security for multi-tenancy
- Edge Functions for app-specific logic
- Real-time subscriptions

### State Management
- React Query (server state)
- React Context (local state)
- Shared cache strategies

## Benefits of This Architecture

### Development Benefits
1. **Code Reuse**: Shared components and logic across apps
2. **Consistency**: Unified design system and patterns
3. **Type Safety**: Shared TypeScript definitions
4. **Faster Development**: Pre-built components and utilities

### Business Benefits
1. **Targeted UX**: Each app optimized for specific user needs
2. **Easier Onboarding**: Simpler interfaces for each user type
3. **Scalability**: Add new apps without affecting existing ones
4. **Market Segmentation**: Different pricing for different user types

### Technical Benefits
1. **Independent Deployment**: Apps can be updated separately
2. **Performance**: Smaller bundle sizes per app
3. **Maintainability**: Clear separation of concerns
4. **Testing**: Easier to test individual components and apps

## Migration Timeline

### Week 1-2: Foundation Setup
- Create packages structure
- Extract shared UI components
- Set up build system

### Week 3-4: Type System & Utils
- Extract shared types
- Move utilities to packages
- Update all imports

### Week 5-6: Auth & API Separation
- Extract authentication logic
- Create API client package
- Test integration

### Week 7-8: First New App
- Create player-portal app
- Implement basic features using shared packages
- Validate architecture

## Challenges & Solutions

### Challenge: Dependency Management
**Solution**: Use workspace dependencies and peer dependencies appropriately

### Challenge: Version Synchronization
**Solution**: Implement automated version bumping and changelog generation

### Challenge: Testing Strategy
**Solution**: Test packages independently and integration tests for apps

### Challenge: Documentation
**Solution**: Storybook for components, API docs for packages

## Success Metrics

1. **Code Reuse**: >60% of code shared across apps
2. **Development Speed**: 50% faster new app creation
3. **Bundle Size**: Individual apps <500KB
4. **Type Coverage**: 100% TypeScript coverage
5. **Test Coverage**: >80% for shared packages

## Next Steps

1. Review and approve this architecture plan
2. Start with Phase 1 implementation
3. Set up GitHub repository structure
4. Begin extracting shared packages
5. Create first specialized app (player-portal)