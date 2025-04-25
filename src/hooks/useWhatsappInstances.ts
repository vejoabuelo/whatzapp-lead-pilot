import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { disconnectInstance } from '@/services/whatsappService';

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

export function useWhatsappInstances() {
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.is_admin || profile?.is_superadmin) {
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
        .order('created_at', { ascending: false })
        .returns<WhatsappInstance[]>();

      if (error) throw error;
      setInstances(data || []);
    } catch (error) {
      console.error('Error fetching WhatsApp instances:', error);
      toast.error('Falha ao carregar instâncias do WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const addInstance = async (
    name: string, 
    instanceId: string, 
    apiKey: string,
    maxFreeUsers: number = 5,
    host: string = 'api.w-api.app'
  ) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert({
          name,
          instance_id: instanceId,
          api_key: apiKey,
          host,
          is_available: true,
          max_free_users: maxFreeUsers,
          current_free_users: 0
        })
        .select()
        .returns<WhatsappInstance[]>();

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
        .select()
        .returns<WhatsappInstance[]>();

      if (error) throw error;
      setInstances(prev => 
        prev.map(inst => inst.id === id ? data[0] : inst)
      );
      toast.success('Instância atualizada com sucesso');
      return data[0];
    } catch (error) {
      console.error('Error updating WhatsApp instance:', error);
      toast.error('Falha ao atualizar instância do WhatsApp');
      return null;
    }
  };

  const deleteInstance = async (id: string) => {
    try {
      // Primeiro busca a instância para ter acesso aos dados
      const instance = instances.find(inst => inst.id === id);
      if (!instance) throw new Error('Instância não encontrada');

      // Se houver um usuário conectado, desconecta a instância
      if (instance.current_user_id) {
        await disconnectInstance(instance.instance_id, instance.api_key);
      }

      // Agora sim exclui a instância
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

  const allocateInstanceForFreeUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Primeiro, verifica se o usuário já tem uma instância alocada
      const { data: userInstance, error: userError } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('current_user_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      if (userInstance) {
        return userInstance; // Usuário já tem uma instância
      }

      // Procura uma instância disponível com espaço para usuários gratuitos
      const { data: availableInstance, error: instanceError } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .lt('current_free_users', 'max_free_users')
        .eq('is_available', true)
        .order('current_free_users', { ascending: true })
        .limit(1)
        .single();

      if (instanceError) throw instanceError;

      if (!availableInstance) {
        toast.error('Não há instâncias disponíveis para usuários gratuitos');
        return null;
      }

      // Atualiza a instância com o novo usuário
      const { data: updatedInstance, error: updateError } = await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: userId,
          current_free_users: availableInstance.current_free_users + 1
        })
        .eq('id', availableInstance.id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Instância alocada com sucesso');
      return updatedInstance;
    } catch (error) {
      console.error('Error allocating WhatsApp instance for free user:', error);
      toast.error('Falha ao alocar instância do WhatsApp');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: instance, error: findError } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('current_user_id', userId)
        .single()
        .returns<WhatsappInstance>();

      if (findError) throw findError;

      if (!instance) {
        toast.error('Usuário não possui instância alocada');
        return false;
      }

      const { error: updateError } = await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: null,
          current_free_users: Math.max(0, instance.current_free_users - 1)
        })
        .eq('id', instance.id);

      if (updateError) throw updateError;

      await fetchInstances(); // Recarrega as instâncias para atualizar a lista
      toast.success('Usuário desconectado com sucesso');
      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      toast.error('Falha ao desconectar usuário');
      return false;
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
    allocateInstanceForFreeUser,
    disconnectUser,
    isAllocating: isLoading
  };
}
