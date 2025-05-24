
import { supabase } from '@/integrations/supabase/client';
import type { MessageCategory, MessageTemplate } from '@/types/database';

export interface DatabaseCategory {
  id: string;
  name: string;
  description: string | null;
  segment: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTemplate {
  id: string;
  category_id: string;
  content: string;
  variables_used: string[] | null;
  usage_count: number;
  response_rate: number | null;
  created_at: string;
  updated_at: string;
}

export class MessageService {
  static async createCategory(categoryData: Partial<MessageCategory>): Promise<DatabaseCategory> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('message_categories')
      .insert({
        ...categoryData,
        user_id: session.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserCategories(): Promise<DatabaseCategory[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('message_categories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createTemplate(templateData: Partial<MessageTemplate>): Promise<DatabaseTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTemplatesByCategory(categoryId: string): Promise<DatabaseTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateTemplate(id: string, updates: Partial<DatabaseTemplate>): Promise<DatabaseTemplate> {
    const { data, error } = await supabase
      .from('message_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async incrementTemplateUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: id
    });

    if (error) {
      // Fallback: manual increment
      const { data: template } = await supabase
        .from('message_templates')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('message_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', id);
      }
    }
  }
}

export default MessageService;
