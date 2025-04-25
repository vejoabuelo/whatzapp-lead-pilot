import { supabase } from '@/integrations/supabase/client';

export interface MessageCategory {
  id: string;
  name: string;
  description: string | null;
  message_count: number;
  created_at: string;
  user_id: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category_id: string;
  variables: string[];
  created_at: string;
  user_id: string;
  updated_at: string;
}

interface NewCategory {
  name: string;
  description?: string | null;
}

interface NewTemplate {
  name: string;
  description?: string | null;
  content: string;
  category_id: string;
  variables?: string[];
}

interface DatabaseCategory {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface DatabaseTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category_id: string;
  variables: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

type CategoryResult = DatabaseCategory & { message_count: number };

interface UpdateTemplate {
  content: string;
  category_id: string;
}

class MessageService {
  private static instance: MessageService;
  
  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // Obter o ID do usuário autenticado
  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  // Extrair variáveis de uma mensagem
  private extractVariables(content: string): string[] {
    const variableRegex = /{{([^}]+)}}/g;
    const matches = [...content.matchAll(variableRegex)];
    return matches.map(match => match[1]);
  }

  // Categorias
  async getCategories(): Promise<CategoryResult[]> {
    const userId = await this.getUserId();
    
    // @ts-expect-error - Ignorando aviso de instanciação profunda
    const { data: categories, error: categoriesError } = await supabase
      .from('message_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (categoriesError) throw categoriesError;
    if (!categories) return [];

    // Buscar contagens separadamente para evitar instanciação profunda de tipos
    const categoriesWithCount = [];
    for (const category of categories) {
      const { count, error: countError } = await supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('user_id', userId);
      
      if (countError) throw countError;
      
      categoriesWithCount.push({
        ...category,
        message_count: count || 0
      });
    }

    return categoriesWithCount;
  }

  async createCategory(category: NewCategory): Promise<MessageCategory> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('message_categories')
      .insert([{
        name: category.name,
        description: category.description || null,
        user_id: userId
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    
    const newCategory = data as DatabaseCategory;
    return {
      ...newCategory,
      message_count: 0
    };
  }

  async deleteCategory(id: string): Promise<void> {
    const userId = await this.getUserId();
    
    // Verificar se há mensagens nesta categoria
    const { count, error: countError } = await supabase
      .from('message_templates')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('user_id', userId);
    
    if (countError) throw countError;
    
    if (count && count > 0) {
      // Se houver mensagens, excluí-las primeiro
      const { error: deleteTemplatesError } = await supabase
        .from('message_templates')
        .delete()
        .eq('category_id', id)
        .eq('user_id', userId);
      
      if (deleteTemplatesError) throw deleteTemplatesError;
    }
    
    // Agora excluir a categoria
    const { error } = await supabase
      .from('message_categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  // Templates
  async getTemplatesByCategory(categoryId: string): Promise<MessageTemplate[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as DatabaseTemplate[];
  }

  async createTemplate(template: NewTemplate): Promise<MessageTemplate> {
    const userId = await this.getUserId();
    const variables = template.variables || this.extractVariables(template.content);
    
    const { data, error } = await supabase
      .from('message_templates')
      .insert([{
        name: template.name,
        description: template.description || null,
        content: template.content,
        category_id: template.category_id,
        variables: variables,
        user_id: userId
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Atualizar contagem de mensagens na categoria
    await this.updateCategoryMessageCount(template.category_id);
    
    return data as DatabaseTemplate;
  }

  async deleteTemplate(id: string, categoryId: string): Promise<void> {
    const userId = await this.getUserId();
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Atualizar contagem de mensagens na categoria
    await this.updateCategoryMessageCount(categoryId);
  }
  
  private async updateCategoryMessageCount(categoryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const { count, error: countError } = await supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('user_id', userId);
      
      if (countError) throw countError;
      
      const { error } = await supabase
        .from('message_categories')
        .update({ message_count: count || 0 } as DatabaseCategory)
        .eq('id', categoryId)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar contagem de mensagens:", error);
    }
  }

  async updateTemplate(id: string, template: UpdateTemplate): Promise<MessageTemplate> {
    const userId = await this.getUserId();
    const variables = this.extractVariables(template.content);
    
    const { data, error } = await supabase
      .from('message_templates')
      .update({
        content: template.content,
        category_id: template.category_id,
        variables: variables,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Atualizar contagem de mensagens nas categorias se mudou de categoria
    const oldTemplate = await this.getTemplateById(id);
    if (oldTemplate && oldTemplate.category_id !== template.category_id) {
      await this.updateCategoryMessageCount(oldTemplate.category_id);
      await this.updateCategoryMessageCount(template.category_id);
    }
    
    return data as DatabaseTemplate;
  }

  async getTemplateById(id: string): Promise<MessageTemplate | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data as DatabaseTemplate;
  }
}

export const messageService = MessageService.getInstance(); 