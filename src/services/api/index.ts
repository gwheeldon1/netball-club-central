
// Consolidated API - Single entry point for all data operations
export { userApi } from './users';
export { teamApi } from './teams';
export { eventApi } from './events';
export { childApi } from './children';
export { attendanceApi } from './attendance';
export { groupApi } from './groups';
export { api } from './unified';

// Note: Update all imports from '@/services/unifiedApi' to '@/services/api'
