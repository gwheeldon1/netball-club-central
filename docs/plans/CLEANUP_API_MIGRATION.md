# API Migration Cleanup Plan

## Objective
Complete migration from old supabaseApi to unified API architecture

## Remaining Work
- [ ] Fix all import statements in remaining files
- [ ] Update all function calls to match unified API signatures  
- [ ] Remove/refactor syncService.ts (uses old API extensively)
- [ ] Test all components after migration

## Files to Fix
- [ ] src/pages/ApprovalsPage.tsx (needs view first)
- [x] src/pages/ChildDetailPage.tsx  
- [x] src/pages/ChildrenPage.tsx
- [ ] src/pages/Dashboard.tsx (needs view first)
- [ ] src/pages/EditTeamPage.tsx (needs view first)
- [x] src/pages/UserProfilePage.tsx
- [x] src/pages/TeamDetailPage.tsx
- [x] src/pages/NewChildPage.tsx
- [x] src/pages/NewTeamPage.tsx
- [x] src/pages/RegistrationPage.tsx
- [x] src/pages/EventsPage.tsx
- [ ] src/services/syncService.ts (needs complete refactor - uses old API extensively)

## Definition of Done
- [ ] Zero TypeScript build errors
- [ ] All components use unified API
- [ ] No references to old supabaseApi
- [ ] Plan document deleted