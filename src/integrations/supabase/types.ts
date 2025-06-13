export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_responses: {
        Row: {
          attendance_marked_at: string | null
          attended: boolean | null
          event_id: string | null
          id: string
          notes: string | null
          player_id: string | null
          response_date: string | null
          rsvp_status: string
        }
        Insert: {
          attendance_marked_at?: string | null
          attended?: boolean | null
          event_id?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          response_date?: string | null
          rsvp_status: string
        }
        Update: {
          attendance_marked_at?: string | null
          attended?: boolean | null
          event_id?: string | null
          id?: string
          notes?: string | null
          player_id?: string | null
          response_date?: string | null
          rsvp_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_responses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_home: boolean | null
          location: string | null
          team_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          team_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_home?: boolean | null
          location?: string | null
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          code_of_conduct_accepted: boolean | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          photo_consent: boolean | null
          player_id: string | null
          profile_image: string | null
          registration_date: string | null
          rejection_reason: string | null
          relationship: string | null
          terms_accepted: boolean | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code_of_conduct_accepted?: boolean | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          photo_consent?: boolean | null
          player_id?: string | null
          profile_image?: string | null
          registration_date?: string | null
          rejection_reason?: string | null
          relationship?: string | null
          terms_accepted?: boolean | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code_of_conduct_accepted?: boolean | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          photo_consent?: boolean | null
          player_id?: string | null
          profile_image?: string | null
          registration_date?: string | null
          rejection_reason?: string | null
          relationship?: string | null
          terms_accepted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_teams: {
        Row: {
          id: string
          join_date: string | null
          player_id: string | null
          team_id: string | null
        }
        Insert: {
          id?: string
          join_date?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Update: {
          id?: string
          join_date?: string | null
          player_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_teams_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          address: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          phone: string | null
          postal_code: string | null
          profile_image: string | null
          rejection_reason: string | null
          sign_up_date: string | null
          team_preference: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          profile_image?: string | null
          rejection_reason?: string | null
          sign_up_date?: string | null
          team_preference?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          profile_image?: string | null
          rejection_reason?: string | null
          sign_up_date?: string | null
          team_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_preference_fkey"
            columns: ["team_preference"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          id: string
          name: string
          season_year: number | null
        }
        Insert: {
          age_group: string
          id?: string
          name: string
          season_year?: number | null
        }
        Update: {
          age_group?: string
          id?: string
          name?: string
          season_year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          guardian_id: string
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          team_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          guardian_id: string
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          guardian_id?: string
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_uk_age_group: {
        Args: { date_of_birth: string }
        Returns: string
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      has_role: {
        Args: {
          user_id: string
          check_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      has_team_role: {
        Args: {
          user_id: string
          check_role: Database["public"]["Enums"]["user_role"]
          check_team_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "parent" | "coach" | "manager" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["parent", "coach", "manager", "admin"],
    },
  },
} as const
