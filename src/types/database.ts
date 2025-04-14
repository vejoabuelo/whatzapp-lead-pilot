
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

export interface Lead {
  id: string;
  cnpj: string;
  company_name: string;
  phone_number: string;
  city: string | null;
  state: string | null;
  cnae: string | null;
  cnae_description: string | null;
  capital_social: number | null;
  opening_date: string | null;
  has_whatsapp: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  status: string;
  min_delay: number;
  max_delay: number;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  lead_id: string;
  message_template_id: string | null;
  status: string;
  sent_message: string | null;
  sent_at: string | null;
  whatsapp_connection_id: string | null;
  error_message: string | null;
  has_response: boolean | null;
  response_at: string | null;
  user_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  category_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsappConnection {
  id: string;
  user_id: string;
  name: string;
  status: string;
  connected_at: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadTag {
  id: string;
  user_id: string;
  lead_id: string;
  tag: string;
  created_at: string;
  updated_at: string;
}
