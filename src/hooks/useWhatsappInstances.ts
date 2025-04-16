
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface WhatsappInstance {
  id: string;
  instance_id: string;
  api_key: string;
  name: string;
  is_available: boolean;
  current_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useWhatsappInstances() {
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.is_admin) {
      fetchInstances();
    } else {
      setInstances([]);
      setIsLoading(false);
    }
  }, [profile]);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching WhatsApp instances:', error);
      toast.error('Falha ao carregar instâncias do WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const addInstance = async (name: string, instanceId: string, apiKey: string) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert({
          name,
          instance_id: instanceId,
          api_key: apiKey,
          is_available: true
        })
        .select();

      if (error) throw error;
      setInstances(prev => [data[0], ...prev]);
      toast.success('Instância adicionada com sucesso');
      return data[0];
    } catch (error) {
      console.error('Error adding WhatsApp instance:', error);
      toast.error('Falha ao adicionar instância do WhatsApp');
      return null;
    }
  };

  const updateInstance = async (id: string, updates: Partial<WhatsappInstance>) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      setInstances(prev => 
        prev.map(inst => inst.id === id ? data[0] : inst)
      );
      return data[0];
    } catch (error) {
      console.error('Error updating WhatsApp instance:', error);
      toast.error('Falha ao atualizar instância do WhatsApp');
      return null;
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
      return true;
    } catch (error) {
      console.error('Error deleting WhatsApp instance:', error);
      toast.error('Falha ao remover instância do WhatsApp');
      return false;
    }
  };

  const allocateInstance = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        'allocate_whatsapp_instance',
        { user_id: userId }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error allocating WhatsApp instance:', error);
      toast.error('Não foi possível alocar uma instância do WhatsApp');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    instances,
    isLoading,
    fetchInstances,
    addInstance,
    updateInstance,
    deleteInstance,
    allocateInstance,
    isAllocating: isLoading
  };
}
