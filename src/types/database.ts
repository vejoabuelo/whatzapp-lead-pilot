
export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  business_type: string | null;
  business_size: string | null;
  is_admin: boolean;
  is_superadmin: boolean;
  whatsapp_connections_limit?: number;
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

export interface Empresa {
  id: string;
  cnpj_basico: string;
  razao_social: string;
  nome_fantasia: string | null;
  tem_dados_empresa: string;
  tem_dados_socio: string;
  natureza_juridica: string;
  porte: number;
  capital_social: string;
  tipo_logradouro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  codigo_municipio: number | null;
  municipio: string | null;
  uf: string | null;
  telefone_1: string | null;
  telefone_2: string | null;
  email: string | null;
  cnae_fiscal: number | null;
  cnae_descricao: string | null;
  cnae_fiscal_secundario: string | null;
  data_inicio_atividade: string | null;
  codigo_situacao_cadastral: number;
  situacao_cadastral: string;
  data_situacao_cadastral: string | null;
  motivo_situacao_cadastral: number | null;
  identificador_matriz_filial: number;
  has_whatsapp: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  total_leads: number;
  sent_count: number;
  success_count: number;
  failed_count: number;
  response_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  empresa_id: string;
  message_template_id: string | null;
  status: string;
  sent_message: string | null;
  sent_at: string | null;
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
  segment: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  category_id: string;
  content: string;
  variables_used: string[] | null;
  usage_count: number;
  response_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsappConnection {
  id: string;
  user_id: string;
  name: string;
  status: string;
  phone_number: string | null;
  connected_at: string | null;
  last_used_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadTag {
  id: string;
  user_id: string;
  empresa_id: string;
  tag: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsappInstance {
  id: string;
  name: string;
  instance_id: string;
  api_key: string;
  host: string;
  is_available: boolean;
  current_user_id: string | null;
  max_free_users: number;
  current_free_users: number;
  created_at: string;
  updated_at: string;
}
