import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { instanceId, status } = req.body;

    // Busca a conexão associada a esta instância
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('id')
      .eq('instance_id', instanceId)
      .single();

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Atualiza o status da conexão
    const { error } = await supabase
      .from('whatsapp_connections')
      .update({ 
        status: status === 'connected' ? 'connected' : 'disconnected',
        connected_at: status === 'connected' ? new Date().toISOString() : null
      })
      .eq('id', connection.id);

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 