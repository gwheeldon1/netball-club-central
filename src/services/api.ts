
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types';

export const api = {
  async getTeams(): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('archived', false)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },
};
