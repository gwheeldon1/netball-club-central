# Shot Tracker Project Knowledge Base

## Core Architectural Principles

### 1. No Temporary Fixes Policy
- **NEVER** create temporary compatibility layers or stub functions
- **NEVER** reduce functionality to fix build errors
- **ALWAYS** implement complete solutions or leave the old system in place until ready
- **DELETE** files immediately when they become redundant
- **REMOVE** unused functions and imports as soon as they're no longer needed

### 2. Clean Code Standards
- One responsibility per file/function
- Clear, descriptive names for all variables, functions, and files
- Remove dead code immediately
- No commented-out code blocks
- Consistent error handling patterns throughout

### 3. API Architecture Guidelines

#### Current Architecture: Unified API (Single Source of Truth)
- **Primary API**: `src/services/unifiedApi.ts` - handles all data operations
- **Offline-First**: All operations work offline and sync when online
- **Consistent Interface**: Same method signatures across all operations

#### Migration Pattern (When Updating API)
```typescript
// 1. Implement new functionality in unifiedApi.ts FIRST
// 2. Update calling components to use new API
// 3. Remove old API files completely
// 4. Update imports systematically
// 5. Test each component after migration
```

#### Forbidden Patterns
- Creating stub functions that return empty promises
- Mixing old and new API calls in same component
- Keeping compatibility layers "just in case"

### 4. Database Integration Standards

#### Supabase Integration
- Use direct Supabase client for real-time operations
- Use unifiedApi for standard CRUD operations
- Implement proper RLS policies for all tables
- Use migrations for all database changes

#### Data Flow Pattern
```
Component → unifiedApi → (online) Supabase | (offline) IndexedDB → Sync when online
```

### 5. Error Handling Standards

#### Consistent Error Pattern
```typescript
try {
  const result = await api.operation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  toast.error('User-friendly message');
  throw error; // Re-throw for caller to handle
}
```

#### Error Boundaries
- Implement error boundaries for all major sections
- Log errors to monitoring service
- Show user-friendly error messages
- Provide recovery options where possible

### 6. Authentication Standards

#### Implementation Requirements
- Store complete session object, not just user
- Configure Supabase client with explicit auth options
- Set up auth state listeners before checking existing sessions
- Always set emailRedirectTo for sign up

#### Required Implementation Pattern
```typescript
const [user, setUser] = useState<User | null>(null);
const [session, setSession] = useState<Session | null>(null);

useEffect(() => {
  // 1. Set up listener first
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  // 2. Then check existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

### 7. Component Architecture

#### File Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── pages/               # Route components
├── hooks/               # Custom hooks
├── services/            # API and external services
├── types/               # TypeScript definitions
└── utils/               # Utility functions
```

#### Component Standards
- Maximum 200 lines per component file
- Extract custom hooks for complex logic
- Use proper TypeScript interfaces
- Implement proper loading and error states

### 8. TypeScript Standards

#### Type Definitions
- Define interfaces for all data structures
- Use proper generic types
- Avoid `any` type except for external libraries
- Export types from centralized location

#### Current Type Structure
```typescript
// Core types in src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

// Database types in src/types/database.ts
// API types in src/services/api/types.ts
```

### 9. State Management

#### Current Pattern: Context + Hooks
- Use React Context for global state (auth, theme)
- Use local state for component-specific data
- Use custom hooks for complex state logic
- Implement proper loading states

#### Forbidden Patterns
- Prop drilling more than 2 levels
- Sharing state through global variables
- Using setState in useEffect without dependencies

### 10. Testing Requirements

#### Before Marking Any Task Complete
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] Component renders correctly
- [ ] Error states handled properly
- [ ] Loading states implemented
- [ ] Responsive design works
- [ ] Accessibility considerations met

## Project Planning Template

### Implementation Plan Structure
```markdown
# [Feature Name] Implementation Plan

## Objective
Clear description of what we're building and why.

## Success Criteria
- [ ] Specific, measurable outcomes
- [ ] User experience requirements
- [ ] Technical requirements
- [ ] Performance requirements

## Dependencies
- List any dependencies that must be completed first
- External services required
- Database changes needed

## Implementation Steps
- [ ] Step 1: Specific action with clear deliverable
- [ ] Step 2: Next action that builds on step 1
- [ ] Step 3: Continue until feature complete

## Cleanup Required
- [ ] Remove any temporary files
- [ ] Delete unused functions
- [ ] Update imports
- [ ] Update documentation

## Testing Checklist
- [ ] Component renders without errors
- [ ] All error cases handled
- [ ] Loading states work correctly
- [ ] Responsive design verified
- [ ] TypeScript types are correct

## Definition of Done
- [ ] All implementation steps completed
- [ ] All cleanup completed
- [ ] All testing passed
- [ ] Documentation updated
- [ ] Plan document deleted
```

### Plan Management
- Create plan in `docs/plans/` directory
- Reference plan document in each commit
- Update plan after each work session
- Mark items complete only when fully tested
- Delete plan document when 100% complete

## Development Workflow

### Before Starting Any Work
1. Create implementation plan (if significant change)
2. Review current codebase for affected areas
3. Identify all files that need changes
4. Plan cleanup requirements

### During Development
1. Implement changes systematically
2. Test each component after changes
3. Update plan document progress
4. Remove dead code immediately
5. Update TypeScript types as needed

### Before Committing
1. Verify all TypeScript errors resolved
2. Test in browser for runtime errors
3. Check responsive design
4. Update documentation if needed
5. Remove any temporary files
6. Update plan document

### After Completion
1. Final testing of entire feature
2. Update main documentation
3. Delete implementation plan
4. Clean up any remaining unused code

## Common Anti-Patterns to Avoid

### 1. Temporary Solutions
```typescript
// ❌ DON'T DO THIS
export const temporaryApi = {
  getData: () => Promise.resolve([])
};

// ✅ DO THIS INSTEAD
// Implement proper solution or keep old system until ready
```

### 2. Incomplete Migrations
```typescript
// ❌ DON'T DO THIS
import { oldApi } from './oldApi';
import { newApi } from './newApi';

// Mix of old and new APIs

// ✅ DO THIS INSTEAD
import { api } from './unifiedApi';
// Use only the unified API
```

### 3. Function Signature Mismatches
```typescript
// ❌ DON'T DO THIS
const result = await api.getUserById(); // No ID provided

// ✅ DO THIS INSTEAD
const result = await api.getUserById(userId);
```

### 4. Error Suppression
```typescript
// ❌ DON'T DO THIS
try {
  await riskyOperation();
} catch {
  // Silently ignore errors
}

// ✅ DO THIS INSTEAD
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  toast.error('Something went wrong');
  throw error;
}
```

## Quality Gates

### Code Review Checklist
- [ ] No temporary fixes or stubs
- [ ] All functions have proper implementations
- [ ] TypeScript errors resolved
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] No dead code remaining
- [ ] Documentation updated

### Definition of Ready (Before Starting)
- [ ] Requirements clearly defined
- [ ] Implementation plan created
- [ ] Dependencies identified
- [ ] Success criteria established

### Definition of Done (Before Completing)
- [ ] All acceptance criteria met
- [ ] Code review passed
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design works
- [ ] Error cases handled
- [ ] Documentation updated
- [ ] Plan document deleted

## Emergency Procedures

### If Build is Broken
1. **DO NOT** create temporary fixes
2. Identify root cause of build errors
3. Fix systematically or revert to working state
4. Update implementation plan if needed

### If Feature is Half-Implemented
1. Complete the implementation properly
2. **OR** revert to previous working state
3. **NEVER** leave broken functionality in codebase

### If Dependencies are Missing
1. Add proper dependencies
2. Update implementation plan
3. **NEVER** create mock implementations

## Monitoring and Maintenance

### Regular Code Health Checks
- Weekly review of technical debt
- Monthly dependency updates
- Quarterly architecture review
- Remove unused packages immediately

### Performance Monitoring
- Track bundle size changes
- Monitor API response times
- Check for memory leaks
- Optimize images and assets

This knowledge base should be updated whenever new patterns emerge or lessons are learned from development experience.
