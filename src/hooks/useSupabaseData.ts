
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define table names that exist in our database
type TableName = 
  | 'profiles'
  | 'plans' 
  | 'user_plans'
  | 'target_preferences'
  | 'empresas'
  | 'leads'
  | 'campaigns'
  | 'message_categories'
  | 'message_templates'
  | 'whatsapp_instances'
  | 'whatsapp_connections'
  | 'campaign_leads'
  | 'lead_tags';

interface UseSupabaseDataOptions {
  defaultData?: any[];
  queryFilter?: (query: any) => any;
  fetchOnMount?: boolean;
}

export function useSupabaseData<T extends Record<string, any> = Record<string, any>>(
  tableName: TableName,
  options?: UseSupabaseDataOptions
) {
  const [data, setData] = useState<T[]>((options?.defaultData as T[]) || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.fetchOnMount) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select('*');
      
      if (options?.queryFilter) {
        query = options.queryFilter(query);
      }
      
      const { data: result, error } = await query;

      if (error) throw error;

      setData((result as T[]) || []);
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(err as Error);
      toast.error(`Erro ao carregar dados de ${tableName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(item as any)
        .select();

      if (error) throw error;

      if (result && result[0]) {
        setData(prev => [...prev, result[0] as T]);
        toast.success('Item adicionado com sucesso');
        return result[0] as T;
      }
    } catch (err) {
      console.error(`Error adding item to ${tableName}:`, err);
      toast.error(`Erro ao adicionar item em ${tableName}`);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(updates as any)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (result && result[0]) {
        setData(prev => prev.map(item => 
          item.id === id ? result[0] as T : item
        ));
        toast.success('Item atualizado com sucesso');
        return result[0] as T;
      }
    } catch (err) {
      console.error(`Error updating item in ${tableName}:`, err);
      toast.error(`Erro ao atualizar item em ${tableName}`);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Item removido com sucesso');
    } catch (err) {
      console.error(`Error deleting item from ${tableName}:`, err);
      toast.error(`Erro ao remover item de ${tableName}`);
      throw err;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchData,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchData
  };
}
