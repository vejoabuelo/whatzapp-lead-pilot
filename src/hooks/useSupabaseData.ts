
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSupabaseData<T>(
  tableName: string,
  options?: {
    defaultData?: T[];
    queryFilter?: (query: any) => any;
  }
) {
  const [data, setData] = useState<T[]>(options?.defaultData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

      setData(result as T[]);
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
        .insert(item)
        .select();

      if (error) throw error;

      setData(prev => [...prev, result[0] as T]);
      toast.success('Item adicionado com sucesso');
      return result[0];
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
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      setData(prev => prev.map(item => (item as any).id === id ? result[0] as T : item));
      toast.success('Item atualizado com sucesso');
      return result[0];
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

      setData(prev => prev.filter(item => (item as any).id !== id));
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
  };
}
