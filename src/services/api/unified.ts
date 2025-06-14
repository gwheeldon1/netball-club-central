// Unified API - maintains backward compatibility
import { BaseAPI } from './base';
import { userApi } from './users';
import { teamApi } from './teams';
import { eventApi } from './events';
import { childApi } from './children';
import { attendanceApi } from './attendance';

export class UnifiedAPI extends BaseAPI {
  // User operations
  getUsers = userApi.getUsers.bind(userApi);
  getUserById = userApi.getUserById.bind(userApi);
  createUser = userApi.createUser.bind(userApi);

  // Team operations
  getTeams = teamApi.getTeams.bind(teamApi);
  getTeamById = teamApi.getTeamById.bind(teamApi);
  createTeam = teamApi.createTeam.bind(teamApi);
  updateTeam = teamApi.updateTeam.bind(teamApi);
  deleteTeam = teamApi.deleteTeam.bind(teamApi);

  // Event operations
  getEvents = eventApi.getEvents.bind(eventApi);
  getEventById = eventApi.getEventById.bind(eventApi);
  createEvent = eventApi.createEvent.bind(eventApi);
  updateEvent = eventApi.updateEvent.bind(eventApi);
  deleteEvent = eventApi.deleteEvent.bind(eventApi);

  // Child operations
  getChildren = childApi.getChildren.bind(childApi);
  getChildrenByTeamId = childApi.getChildrenByTeamId.bind(childApi);
  createChild = childApi.createChild.bind(childApi);
  updateChild = childApi.updateChild.bind(childApi);

  // Attendance operations
  getAttendanceByEventId = attendanceApi.getAttendanceByEventId.bind(attendanceApi);
  createAttendance = attendanceApi.createAttendance.bind(attendanceApi);

  // Sync operations
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      // TODO: Implement sync from all modules
    }
  }
}

export const api = new UnifiedAPI();