
export interface Profile {
  id: string;
  full_name: string | null;
  business_type: string | null;
  business_size: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetPreferences {
  id: string;
  user_id: string;
  target_segments: string[];
  target_locations: string[];
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  leads_limit: number;
  messages_limit: number;
  campaigns_limit: number;
  whatsapp_connections_limit: number;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}
