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
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      event_responses: {
        Row: {
          attendance_marked_at: string | null
          attendance_status: string | null
          attended: boolean | null
          event_id: string | null
          id: string
          marked_by: string | null
          notes: string | null
          player_id: string | null
          response_date: string | null
          rsvp_status: string
        }
        Insert: {
          attendance_marked_at?: string | null
          attendance_status?: string | null
          attended?: boolean | null
          event_id?: string | null
          id?: string
          marked_by?: string | null
          notes?: string | null
          player_id?: string | null
          response_date?: string | null
          rsvp_status: string
        }
        Update: {
          attendance_marked_at?: string | null
          attendance_status?: string | null
          attended?: boolean | null
          event_id?: string | null
          id?: string
          marked_by?: string | null
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
            foreignKeyName: "event_responses_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "guardians"
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
          parent_event_id: string | null
          recurrence_days: string[] | null
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_type: string | null
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
          parent_event_id?: string | null
          recurrence_days?: string[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
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
          parent_event_id?: string | null
          recurrence_days?: string[] | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
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
          additional_notes: string | null
          allergies: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          code_of_conduct_accepted: boolean | null
          dietary_requirements: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          id: string
          last_name: string
          medical_conditions: string | null
          medications: string | null
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
          additional_notes?: string | null
          allergies?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code_of_conduct_accepted?: boolean | null
          dietary_requirements?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          id?: string
          last_name: string
          medical_conditions?: string | null
          medications?: string | null
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
          additional_notes?: string | null
          allergies?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code_of_conduct_accepted?: boolean | null
          dietary_requirements?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          id?: string
          last_name?: string
          medical_conditions?: string | null
          medications?: string | null
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
      match_statistics: {
        Row: {
          contacts: number
          created_at: string
          created_by: string | null
          event_id: string
          footwork_errors: number
          goals: number
          id: string
          intercepts: number
          obstructions: number
          player_id: string
          player_of_match_coach: boolean
          player_of_match_players: boolean
          quarters_played: number
          shot_attempts: number
          tips: number
          turnovers_lost: number
          turnovers_won: number
          updated_at: string
        }
        Insert: {
          contacts?: number
          created_at?: string
          created_by?: string | null
          event_id: string
          footwork_errors?: number
          goals?: number
          id?: string
          intercepts?: number
          obstructions?: number
          player_id: string
          player_of_match_coach?: boolean
          player_of_match_players?: boolean
          quarters_played?: number
          shot_attempts?: number
          tips?: number
          turnovers_lost?: number
          turnovers_won?: number
          updated_at?: string
        }
        Update: {
          contacts?: number
          created_at?: string
          created_by?: string | null
          event_id?: string
          footwork_errors?: number
          goals?: number
          id?: string
          intercepts?: number
          obstructions?: number
          player_id?: string
          player_of_match_coach?: boolean
          player_of_match_players?: boolean
          quarters_played?: number
          shot_attempts?: number
          tips?: number
          turnovers_lost?: number
          turnovers_won?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_event_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_event_id?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_event_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_pence: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          currency: string
          description: string | null
          failure_reason: string | null
          guardian_id: string
          id: string
          payment_method: string | null
          payment_type: string | null
          processed_at: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount_pence: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failure_reason?: string | null
          guardian_id: string
          id?: string
          payment_method?: string | null
          payment_type?: string | null
          processed_at?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount_pence?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          failure_reason?: string | null
          guardian_id?: string
          id?: string
          payment_method?: string | null
          payment_type?: string | null
          processed_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_guardian"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_subscription"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
          additional_medical_notes: string | null
          address: string | null
          allergies: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          code_of_conduct_accepted: boolean | null
          data_processing_consent: boolean | null
          date_of_birth: string | null
          dietary_requirements: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          medical_conditions: string | null
          medications: string | null
          phone: string | null
          photo_consent: boolean | null
          postal_code: string | null
          profile_image: string | null
          rejection_reason: string | null
          sign_up_date: string | null
          team_preference: string | null
          terms_accepted: boolean | null
        }
        Insert: {
          additional_medical_notes?: string | null
          address?: string | null
          allergies?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          code_of_conduct_accepted?: boolean | null
          data_processing_consent?: boolean | null
          date_of_birth?: string | null
          dietary_requirements?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          photo_consent?: boolean | null
          postal_code?: string | null
          profile_image?: string | null
          rejection_reason?: string | null
          sign_up_date?: string | null
          team_preference?: string | null
          terms_accepted?: boolean | null
        }
        Update: {
          additional_medical_notes?: string | null
          address?: string | null
          allergies?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          code_of_conduct_accepted?: boolean | null
          data_processing_consent?: boolean | null
          date_of_birth?: string | null
          dietary_requirements?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          photo_consent?: boolean | null
          postal_code?: string | null
          profile_image?: string | null
          rejection_reason?: string | null
          sign_up_date?: string | null
          team_preference?: string | null
          terms_accepted?: boolean | null
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_pence: number
          auto_renew: boolean
          billing_cycle: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          guardian_id: string
          id: string
          next_billing_date: string | null
          player_id: string
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_pence: number
          auto_renew?: boolean
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          guardian_id: string
          id?: string
          next_billing_date?: string | null
          player_id: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_pence?: number
          auto_renew?: boolean
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          guardian_id?: string
          id?: string
          next_billing_date?: string | null
          player_id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subscriptions_guardian"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subscriptions_player"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
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
      handle_guardian_forgot_password: {
        Args: { guardian_email: string }
        Returns: Json
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
