import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { WhatsappConnection } from '@/types/database';
import { toast } from 'sonner';
import { disconnectInstance } from '@/services/whatsappService';

export function useWhatsappConnections() {
  const [connections, setConnections] = useState<WhatsappConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConnections();
    } else {
      setConnections([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data);
    } catch (error) {
      console.error('Error fetching WhatsApp connections:', error);
      toast.error('Falha ao carregar conexões de WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const generateConnectionName = () => {
    const existingNumbers = connections
      .map(c => {
        const match = c.name.match(/WhatsApp #(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const maxNumber = Math.max(0, ...existingNumbers);
    return `WhatsApp #${maxNumber + 1}`;
  };

  const addConnection = async (customName?: string) => {
    if (!user) return null;
    
    try {
      const name = customName || generateConnectionName();
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: user.id,
          name,
          status: 'disconnected',
          instance_id: null
        })
        .select();

      if (error) throw error;
      setConnections(prev => [data[0], ...prev]);
      return data[0];
    } catch (error) {
      console.error('Error adding WhatsApp connection:', error);
      toast.error('Falha ao adicionar conexão de WhatsApp');
      return null;
    }
  };

  const updateConnection = async (id: string, updates: Partial<WhatsappConnection>) => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      setConnections(prev => 
        prev.map(conn => conn.id === id ? data[0] : conn)
      );
      return data[0];
    } catch (error) {
      console.error('Error updating WhatsApp connection:', error);
      toast.error('Falha ao atualizar conexão de WhatsApp');
      return null;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      console.log(`[deleteConnection] Iniciando exclusão para ID: ${id}`);
      // 1. Buscar os dados da conexão
      const { data: connectionData, error: connError } = await supabase
        .from('whatsapp_connections')
        .select('*') // Busca apenas dados da conexão
        .eq('id', id)
        .single(); // Usa single pois esperamos exatamente uma conexão

      if (connError) {
        console.error('[deleteConnection] Erro ao buscar conexão:', connError);
        throw connError;
      }
      if (!connectionData) {
        // Isso não deveria acontecer se connError for null, mas por segurança
        console.error('[deleteConnection] Conexão não encontrada no banco (após single()).');
        throw new Error('Conexão não encontrada');
      }
      console.log('[deleteConnection] Dados da conexão encontrados:', connectionData);

      let instanceDetails: { instance_id: string; api_key: string } | null = null;
      // 2. Se a conexão tem um instance_id, buscar detalhes da instância
      // Tratando connectionData como any para acessar instance_id que não está no tipo
      const connectionInstanceId = (connectionData as any).instance_id;
      if (connectionInstanceId) {
        console.log(`[deleteConnection] Conexão possui instance_id: ${connectionInstanceId}. Buscando detalhes...`);
        const { data: instanceData, error: instanceError } = await supabase
          .from('whatsapp_instances')
          .select('instance_id, api_key')
          .eq('id', connectionInstanceId) // Usa a variável extraída
          .single();

        if (instanceError) {
          console.error('[deleteConnection] Erro ao buscar detalhes da instância:', instanceError);
          // Decide se quer parar ou continuar sem os detalhes
          toast.info('Não foi possível buscar os detalhes da instância associada. Tentando remover a conexão mesmo assim...');
        } else {
          instanceDetails = instanceData;
          console.log('[deleteConnection] Detalhes da instância encontrados:', instanceDetails);
        }
      } else {
        console.log('[deleteConnection] Conexão não possui instance_id.');
      }

      let disconnected = true; // Assume desconectado se não precisar chamar a API
      // Se a conexão estava conectada e temos os detalhes da instância, tenta desconectar
      if (connectionData.status === 'connected' && instanceDetails?.instance_id && instanceDetails?.api_key) {
        console.log('[deleteConnection] Conexão ativa e detalhes encontrados. Tentando desconectar instância...');
        toast.info('Tentando desconectar a instância da W-API...');
        disconnected = await disconnectInstance(instanceDetails.instance_id, instanceDetails.api_key);
        console.log(`[deleteConnection] Resultado da desconexão: ${disconnected}`);
      } else {
        console.log('[deleteConnection] Conexão não estava ativa ou detalhes da instância não encontrados, pulando desconexão da W-API.');
      }

      // Só continua se a desconexão foi bem sucedida (ou não foi necessária)
      if (disconnected) {
        console.log('[deleteConnection] Desconexão OK ou não necessária. Atualizando status e removendo do DB...');
        toast.info('Atualizando status e removendo conexão do banco de dados...');
        
        // Atualiza o status para desconectado
        const { error: updateError } = await supabase
          .from('whatsapp_connections')
          .update({ status: 'disconnected', instance_id: null }) // Limpa o instance_id na conexão
          .eq('id', id);
          
        if (updateError) {
          console.error('[deleteConnection] Erro ao atualizar status/instance_id para disconnected:', updateError);
          toast.info('Falha ao atualizar status da conexão, mas tentando remover mesmo assim.');
        }

        // Agora sim exclui a conexão do banco de dados
        console.log('[deleteConnection] Excluindo conexão do Supabase...');
        const { error: deleteError } = await supabase
          .from('whatsapp_connections')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('[deleteConnection] Erro ao excluir conexão do Supabase:', deleteError);
          throw deleteError; // Cai no catch block abaixo
        }
        
        console.log('[deleteConnection] Conexão excluída do Supabase. Atualizando estado local...');
        setConnections(prev => prev.filter(conn => conn.id !== id));
        toast.success('Conexão removida com sucesso');
        console.log('[deleteConnection] Exclusão concluída com sucesso.');
        return true;
      } else {
        console.error('[deleteConnection] Falha na desconexão da instância W-API.');
        toast.error('Falha ao desconectar a instância na W-API. A conexão não foi removida.');
        return false;
      }

    } catch (error) {
      console.error('[deleteConnection] Erro no catch geral:', error);
      if (!(error instanceof Error && error.message.includes('Falha ao desconectar a instância na W-API'))) {
        toast.error('Falha ao remover conexão de WhatsApp'); 
      }
      return false;
    }
  };

  const updateConnectionName = async (id: string, name: string) => {
    return updateConnection(id, { name });
  };

  return {
    connections,
    isLoading,
    fetchConnections,
    addConnection,
    updateConnection,
    deleteConnection,
    updateConnectionName,
  };
}
