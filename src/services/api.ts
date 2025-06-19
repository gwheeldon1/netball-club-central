
import { api } from './apiService';

// Re-export the main API service
export { api };

// For backward compatibility with existing imports
export const teamApi = api;
export const userApi = api;
export const eventApi = api;
export const childApi = api;
export const attendanceApi = api;
