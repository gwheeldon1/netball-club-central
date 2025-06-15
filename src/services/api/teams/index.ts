
// Main teams API - combines all team operations
import { TeamOperations } from './operations';
import { TeamMembersAPI } from './members';

class TeamAPI extends TeamOperations {
  private membersAPI: TeamMembersAPI;

  constructor() {
    super();
    this.membersAPI = new TeamMembersAPI();
  }

  // Delegate member operations to the members API
  async getTeamPlayers(teamId: string) {
    return this.membersAPI.getTeamPlayers(teamId);
  }

  async getTeamStaff(teamId: string) {
    return this.membersAPI.getTeamStaff(teamId);
  }
}

export const teamApi = new TeamAPI();
