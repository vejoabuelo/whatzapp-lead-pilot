
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { WhatsappConnection } from '@/types/database';
import { toast } from 'sonner';

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

  const addConnection = async (name: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: user.id,
          name,
          status: 'disconnected'
        })
        .select();

      if (error) throw error;
      setConnections(prev => [data[0], ...prev]);
      toast.success('Conexão adicionada com sucesso');
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
      const { error } = await supabase
        .from('whatsapp_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast.success('Conexão removida com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting WhatsApp connection:', error);
      toast.error('Falha ao remover conexão de WhatsApp');
      return false;
    }
  };

  return {
    connections,
    isLoading,
    fetchConnections,
    addConnection,
    updateConnection,
    deleteConnection
  };
}
