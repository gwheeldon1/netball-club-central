# API Architecture Consolidation Plan

## Current State Analysis

### Existing API Layers
- `src/services/unifiedApi.ts` (776 lines) - Main offline-first API with Supabase fallback
- `src/services/database.ts` - IndexedDB offline storage layer
- `src/services/syncService.ts` - Sync coordination (partially implemented)
- `src/services/api/client.ts` - Generic API client with retry logic
- `src/services/api/index.ts` - Re-export wrapper
- `src/services/enhancedApi.ts` - Additional API functionality
- `src/services/auth.ts` - Authentication service

### Issues Identified
1. **Multiple API layers** causing confusion and maintenance overhead
2. **Inconsistent error handling** across different services
3. **Incomplete sync service** with placeholder implementations
4. **Mixed offline/online strategies** not properly unified
5. **Large files** that need refactoring (unifiedApi.ts = 776 lines)

## Consolidation Strategy

### Phase 1: Cleanup and Simplification ✅ PRIORITY
1. **Remove redundant files**
   - Merge useful functionality from `enhancedApi.ts` into `unifiedApi.ts`
   - Remove duplicate API client layers
   - Consolidate auth service integration

2. **Standardize error handling**
   - Implement consistent error types across all APIs
   - Add proper offline error states
   - Create unified loading/error UI patterns

3. **Refactor large files**
   - Split `unifiedApi.ts` into focused modules:
     - `userApi.ts`
     - `teamApi.ts` 
     - `eventApi.ts`
     - `childApi.ts`
     - `attendanceApi.ts`

### Phase 2: Enhance Sync Service
1. **Complete sync implementation**
   - Remove placeholder functions in `syncService.ts`
   - Implement proper conflict resolution
   - Add comprehensive retry logic

2. **Add sync status indicators**
   - Real-time sync progress
   - Conflict resolution UI
   - Offline queue visibility

### Phase 3: Performance Optimization
1. **Optimize data fetching**
   - Implement smart caching strategies
   - Add data prefetching for common operations
   - Reduce redundant API calls

2. **Improve offline experience**
   - Better offline detection
   - Intelligent sync prioritization
   - Background sync optimization

## Implementation Steps

### Step 1: File Consolidation
- [ ] Audit all API-related files for duplicate functionality
- [ ] Merge `enhancedApi.ts` useful features into unified API
- [ ] Remove redundant `api/client.ts` wrapper
- [ ] Update all imports to use consolidated API

### Step 2: Modular Refactoring
- [ ] Split `unifiedApi.ts` into domain-specific modules
- [ ] Create `src/services/api/` directory structure:
  ```
  src/services/api/
  ├── index.ts          # Main exports
  ├── base.ts           # Base API client
  ├── users.ts          # User operations
  ├── teams.ts          # Team operations  
  ├── events.ts         # Event operations
  ├── children.ts       # Child/player operations
  ├── attendance.ts     # Attendance operations
  └── sync.ts           # Sync coordination
  ```

### Step 3: Error Handling Standardization
- [ ] Create unified error types and handling
- [ ] Implement consistent loading states
- [ ] Add proper offline error recovery

### Step 4: Sync Service Enhancement
- [ ] Complete placeholder implementations
- [ ] Add conflict resolution strategies
- [ ] Implement sync status reporting

### Step 5: Testing and Validation
- [ ] Test all API operations offline/online
- [ ] Validate sync behavior under various conditions
- [ ] Performance testing and optimization

## Success Criteria
- ✅ Single, clear API layer with offline-first approach
- ✅ All API operations work consistently offline and online
- ✅ Proper error handling and user feedback
- ✅ Reliable sync with conflict resolution
- ✅ Maintainable, modular code structure
- ✅ No duplicate functionality across services

## Timeline
- **Week 1**: File consolidation and basic refactoring
- **Week 2**: Sync service completion and testing
- **Week 3**: Performance optimization and polish

## Next Actions
1. Start with removing `enhancedApi.ts` and consolidating into unified API
2. Refactor `unifiedApi.ts` into smaller, focused modules
3. Complete sync service implementation
4. Add comprehensive error handling and status indicators