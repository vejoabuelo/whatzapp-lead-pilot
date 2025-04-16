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
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string
          error_message: string | null
          has_response: boolean | null
          id: string
          lead_id: string
          message_template_id: string | null
          response_at: string | null
          sent_at: string | null
          sent_message: string | null
          status: string
          updated_at: string
          user_notes: string | null
          whatsapp_connection_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          error_message?: string | null
          has_response?: boolean | null
          id?: string
          lead_id: string
          message_template_id?: string | null
          response_at?: string | null
          sent_at?: string | null
          sent_message?: string | null
          status?: string
          updated_at?: string
          user_notes?: string | null
          whatsapp_connection_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          error_message?: string | null
          has_response?: boolean | null
          id?: string
          lead_id?: string
          message_template_id?: string | null
          response_at?: string | null
          sent_at?: string | null
          sent_message?: string | null
          status?: string
          updated_at?: string
          user_notes?: string | null
          whatsapp_connection_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_message_template_id_fkey"
            columns: ["message_template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_whatsapp_connection_id_fkey"
            columns: ["whatsapp_connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          category_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          max_delay: number
          min_delay: number
          name: string
          scheduled_for: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_delay?: number
          min_delay?: number
          name: string
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          max_delay?: number
          min_delay?: number
          name?: string
          scheduled_for?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "message_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          tag: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          tag: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          tag?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          capital_social: number | null
          city: string | null
          cnae: string | null
          cnae_description: string | null
          cnpj: string
          company_name: string
          created_at: string
          has_whatsapp: boolean | null
          id: string
          opening_date: string | null
          phone_number: string
          state: string | null
          updated_at: string
        }
        Insert: {
          capital_social?: number | null
          city?: string | null
          cnae?: string | null
          cnae_description?: string | null
          cnpj: string
          company_name: string
          created_at?: string
          has_whatsapp?: boolean | null
          id?: string
          opening_date?: string | null
          phone_number: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          capital_social?: number | null
          city?: string | null
          cnae?: string | null
          cnae_description?: string | null
          cnpj?: string
          company_name?: string
          created_at?: string
          has_whatsapp?: boolean | null
          id?: string
          opening_date?: string | null
          phone_number?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "message_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          campaigns_limit: number
          created_at: string
          description: string | null
          id: string
          leads_limit: number
          messages_limit: number
          name: string
          price_monthly: number
          updated_at: string
          whatsapp_connections_limit: number
        }
        Insert: {
          campaigns_limit: number
          created_at?: string
          description?: string | null
          id?: string
          leads_limit: number
          messages_limit: number
          name: string
          price_monthly: number
          updated_at?: string
          whatsapp_connections_limit?: number
        }
        Update: {
          campaigns_limit?: number
          created_at?: string
          description?: string | null
          id?: string
          leads_limit?: number
          messages_limit?: number
          name?: string
          price_monthly?: number
          updated_at?: string
          whatsapp_connections_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_size: string | null
          business_type: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          business_size?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          business_size?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      target_preferences: {
        Row: {
          created_at: string
          id: string
          target_locations: string[] | null
          target_segments: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_locations?: string[] | null
          target_segments?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_locations?: string[] | null
          target_segments?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          payment_reference: string | null
          plan_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          payment_reference?: string | null
          plan_id: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          payment_reference?: string | null
          plan_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          last_used_at: string | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          api_key: string
          created_at: string
          current_user_id: string | null
          id: string
          instance_id: string
          is_available: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          current_user_id?: string | null
          id?: string
          instance_id: string
          is_available?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          current_user_id?: string | null
          id?: string
          instance_id?: string
          is_available?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_whatsapp_instance: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
