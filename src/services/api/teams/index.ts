
// Team API exports
export { TeamAPI } from './operations';
export { TeamMembersAPI } from './members';
export * from './types';

// Create instances for backward compatibility
import { TeamAPI } from './operations';
import { TeamMembersAPI } from './members';

export const teamApi = new TeamAPI();
export const teamMembersApi = new TeamMembersAPI();
