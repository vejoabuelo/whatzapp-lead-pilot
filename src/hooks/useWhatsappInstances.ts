
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WhatsappInstance } from '@/types/database';

export function useWhatsappInstances() {
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching instances:', error);
      toast.error('Erro ao carregar instâncias do WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const allocateInstance = async (userId: string): Promise<WhatsappInstance | null> => {
    try {
      // Find an available instance
      const { data: availableInstances, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('is_available', true)
        .lt('current_free_users', 'max_free_users');

      if (error) throw error;

      if (!availableInstances || availableInstances.length === 0) {
        toast.error('Nenhuma instância do WhatsApp disponível no momento');
        return null;
      }

      const instance = availableInstances[0];

      // Allocate the instance to the user
      const { data: updatedInstance, error: updateError } = await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: userId,
          current_free_users: instance.current_free_users + 1
        })
        .eq('id', instance.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedInstance;
    } catch (error) {
      console.error('Error allocating instance:', error);
      toast.error('Erro ao alocar instância do WhatsApp');
      return null;
    }
  };

  const releaseInstance = async (instanceId: string, userId: string) => {
    try {
      const { data: instance, error: fetchError } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('id', instanceId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: null,
          current_free_users: Math.max(0, instance.current_free_users - 1)
        })
        .eq('id', instanceId);

      if (error) throw error;

      toast.success('Instância liberada com sucesso');
    } catch (error) {
      console.error('Error releasing instance:', error);
      toast.error('Erro ao liberar instância');
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  return {
    instances,
    isLoading,
    fetchInstances,
    allocateInstance,
    releaseInstance
  };
}
