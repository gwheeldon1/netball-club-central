# API Migration Cleanup Plan

## Objective
Complete migration from old supabaseApi to unified API architecture

## Remaining Work
- [ ] Fix all import statements in remaining files
- [ ] Update all function calls to match unified API signatures  
- [ ] Remove/refactor syncService.ts (uses old API extensively)
- [ ] Test all components after migration

## Files to Fix
- [ ] src/pages/ApprovalsPage.tsx
- [ ] src/pages/ChildDetailPage.tsx  
- [ ] src/pages/ChildrenPage.tsx
- [ ] src/pages/Dashboard.tsx
- [ ] src/pages/EditTeamPage.tsx
- [ ] src/pages/UserProfilePage.tsx
- [ ] src/pages/TeamDetailPage.tsx
- [ ] src/services/syncService.ts

## Definition of Done
- [ ] Zero TypeScript build errors
- [ ] All components use unified API
- [ ] No references to old supabaseApi
- [ ] Plan document deleted