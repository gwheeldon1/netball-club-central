

// Re-export the new clean API service
export { api } from './apiService';

// For backward compatibility
export const teamApi = { api: api };
export const userApi = { api: api };
export const eventApi = { api: api };
export const childApi = { api: api };
export const attendanceApi = { api: api };

