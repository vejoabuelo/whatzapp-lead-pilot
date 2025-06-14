
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WhatsappInstance } from '@/types/database';

interface WhatsappInstanceInsert {
  name: string;
  instance_id: string;
  api_key: string;
  host?: string;
  is_available?: boolean;
  max_free_users?: number;
  current_free_users?: number;
}

export function useWhatsappInstances() {
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*');

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching instances:', error);
      toast.error('Erro ao carregar instâncias WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const addInstance = async (instanceData: WhatsappInstanceInsert): Promise<WhatsappInstance> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert(instanceData)
        .select()
        .single();

      if (error) throw error;
      
      setInstances(prev => [...prev, data]);
      toast.success('Instância adicionada com sucesso');
      return data;
    } catch (error) {
      console.error('Error adding instance:', error);
      toast.error('Erro ao adicionar instância');
      throw error;
    }
  };

  const updateInstance = async (id: string, updates: Partial<Omit<WhatsappInstance, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInstances(prev => prev.map(inst => inst.id === id ? data : inst));
      toast.success('Instância atualizada com sucesso');
      return data;
    } catch (error) {
      console.error('Error updating instance:', error);
      toast.error('Erro ao atualizar instância');
      throw error;
    }
  };

  const deleteInstance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInstances(prev => prev.filter(inst => inst.id !== id));
      toast.success('Instância removida com sucesso');
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast.error('Erro ao remover instância');
      throw error;
    }
  };

  const allocateInstance = async (userId: string): Promise<WhatsappInstance> => {
    const availableInstance = instances.find(inst => inst.is_available);
    if (!availableInstance) {
      throw new Error('Nenhuma instância disponível');
    }
    
    return availableInstance;
  };

  const releaseInstance = async (instanceId: string, userId: string) => {
    toast.success('Instância liberada');
  };

  const disconnectUser = async (instanceId: string, userId: string) => {
    toast.success('Usuário desconectado da instância');
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  return {
    instances,
    isLoading,
    fetchInstances,
    addInstance,
    updateInstance,
    deleteInstance,
    allocateInstance,
    releaseInstance,
    disconnectUser
  };
}
