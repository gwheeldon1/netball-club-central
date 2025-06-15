# Package Consolidation Plan

## Overview
This document outlines the step-by-step plan to migrate existing code into the new monorepo package structure.

## Current Code Mapping

### src/components/ui/ → packages/shared-ui/
**Files to migrate:**
- All component files from `src/components/ui/`
- Layout components from `src/components/layout/`
- Loading components and skeletons

**Dependencies to resolve:**
- Update imports to use package references
- Ensure peer dependencies are properly configured
- Test component isolation

### src/types/ → packages/shared-types/
**Files to migrate:**
- `database.ts`, `database-enhanced.ts`, `supabase.ts`
- `index.ts`, `interfaces.ts`, `unified.ts`
- `component-props.ts` (newly created)

**Reorganization needed:**
- Group by domain (database, api, models, etc.)
- Create proper export structure
- Maintain backward compatibility

### src/utils/ → packages/shared-utils/
**Files to migrate:**
- `cleanConsole.ts`, `logger.ts`, `validation.ts`
- `security.ts`, `performance.ts`, `bundleAnalyzer.ts`
- `errorBoundary.tsx`

**Note:** `lib/utils.ts` stays with design system

### src/context/AuthContext.tsx → packages/auth-lib/
**Files to migrate:**
- `AuthContext.tsx` and related auth logic
- `ProtectedRoute.tsx`
- Auth-related hooks and utilities

**Integration points:**
- Maintain compatibility with existing app structure
- Ensure smooth transition for existing components

### Design system files → packages/design-system/
**Files to migrate:**
- `tailwind.config.ts`
- `index.css` (CSS variables and global styles)
- Theme provider logic

## Migration Steps

### Step 1: Create Package Structure
✅ **Completed**: Created all package.json files and basic structure

### Step 2: Migrate Shared UI Components
**Action items:**
1. Copy component files to `packages/shared-ui/src/components/`
2. Update imports within components
3. Create proper export structure
4. Test components in isolation

### Step 3: Migrate Types
**Action items:**
1. Reorganize types by domain in `packages/shared-types/src/`
2. Create proper barrel exports
3. Update all import statements across the app
4. Ensure type consistency

### Step 4: Migrate Utils
**Action items:**
1. Move utility functions to appropriate packages
2. Update import statements
3. Test utility functions independently
4. Maintain existing functionality

### Step 5: Extract Auth Logic
**Action items:**
1. Move auth context and providers
2. Extract protected route logic
3. Create auth hooks package
4. Test authentication flow

### Step 6: Design System Extraction
**Action items:**
1. Move Tailwind config to design system
2. Extract CSS variables and global styles
3. Create theme utilities
4. Test design consistency

### Step 7: Update Main App
**Action items:**
1. Update all imports to use packages
2. Remove migrated files from src/
3. Test full application functionality
4. Ensure no broken imports

## Import Update Strategy

### Before Migration
```typescript
import { Button } from '@/components/ui/button';
import { User } from '@/types/database';
import { logger } from '@/utils/logger';
```

### After Migration
```typescript
import { Button } from '@netball/shared-ui';
import { User } from '@netball/shared-types';
import { logger } from '@netball/shared-utils';
```

## Testing Strategy

### Package-Level Testing
1. **Unit tests** for each package
2. **Integration tests** between packages
3. **Type checking** for all packages
4. **Build verification** for each package

### App-Level Testing
1. **End-to-end testing** after migration
2. **Visual regression testing** for UI components
3. **Functionality testing** for all features
4. **Performance testing** to ensure no regressions

## Rollback Plan

### If Migration Issues Occur
1. **Keep original files** until migration is verified
2. **Staged rollback** - revert one package at a time
3. **Import aliases** as temporary bridge during transition
4. **Feature flags** to enable/disable package usage

## Verification Checklist

### For Each Package
- [ ] Package builds successfully
- [ ] All exports are working
- [ ] Types are properly defined
- [ ] No circular dependencies
- [ ] Peer dependencies are correct

### For Main App
- [ ] All imports resolve correctly
- [ ] No build errors
- [ ] All features work as expected
- [ ] Performance is maintained
- [ ] Bundle size is optimized

### For Development Experience
- [ ] Hot reload works with packages
- [ ] TypeScript intellisense works
- [ ] Debugging works across packages
- [ ] Error messages are clear

## Timeline

### Week 1: Foundation
- Set up package structure ✅
- Create package.json files ✅
- Set up workspace configuration

### Week 2: UI Migration
- Migrate shared UI components
- Update component imports
- Test component functionality

### Week 3: Types & Utils
- Migrate shared types
- Move utility functions
- Update all import statements

### Week 4: Auth & Final
- Extract auth logic
- Migrate design system
- Complete integration testing
- Documentation updates

## Benefits Tracking

### Development Benefits
- **Faster builds**: Measure build time improvements
- **Better IntelliSense**: Type checking across packages
- **Code reuse**: Track shared component usage

### Maintenance Benefits
- **Clearer dependencies**: Package-level dependency management
- **Better testing**: Isolated package testing
- **Easier updates**: Update packages independently

### Future Benefits
- **New app creation**: Faster development with shared packages
- **Team scaling**: Clear package ownership
- **Third-party usage**: Packages can be used outside ecosystem

## Success Metrics

1. **Build time**: No regression in build performance
2. **Bundle size**: Optimize through better tree-shaking
3. **Developer experience**: Improved IntelliSense and debugging
4. **Code reuse**: >60% of UI components shared
5. **Type safety**: 100% TypeScript coverage maintained