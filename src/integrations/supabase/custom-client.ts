import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// URL e chave da versão atual
const SUPABASE_URL = "https://tryrbcbxqhyqnrakbpdc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeXJiY2J4cWh5cW5yYWticGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDM0MTAsImV4cCI6MjA2MDgxOTQxMH0.9lj6QB6abOsPBrVQs6exKOOxNmAGWNrmtvMh2VGnhvw";

// Create a custom database type that includes our tables
export interface CustomDatabase extends Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          business_type: string | null;
          business_size: string | null;
          is_admin: boolean | null;
          is_superadmin: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          business_type?: string | null;
          business_size?: string | null;
          is_admin?: boolean | null;
          is_superadmin?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          business_type?: string | null;
          business_size?: string | null;
          is_admin?: boolean | null;
          is_superadmin?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Export a typed Supabase client with our extended types
export const supabase = createClient<CustomDatabase>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage
    }
  }
); 