
// Re-export the new clean API service
export { api } from './apiService';

// For backward compatibility
export const teamApi = { api };
export const userApi = { api };
export const eventApi = { api };
export const childApi = { api };
export const attendanceApi = { api };
