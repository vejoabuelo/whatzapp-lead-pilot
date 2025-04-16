
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppMessage {
  phone: string;
  message: string;
  delayMessage?: number;
}

export const WHATSAPP_API_URL = "https://api.w-api.app/v1";

async function getInstanceCredentials() {
  // Get current user session first
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }
  
  // Get the allocated instance for the current user
  const { data: instance, error } = await supabase
    .from('whatsapp_instances')
    .select('instance_id, api_key')
    .eq('current_user_id', session.user.id)
    .single();
  
  if (error || !instance) {
    console.error('Erro ao buscar instância:', error);
    
    // Try to allocate an instance for the user
    const { data: allocatedInstanceId } = await supabase.rpc(
      'allocate_whatsapp_instance',
      { user_id: session.user.id }
    );
    
    if (!allocatedInstanceId) {
      throw new Error('Nenhuma instância do WhatsApp disponível');
    }
    
    // Fetch the newly allocated instance
    const { data: newInstance, error: newError } = await supabase
      .from('whatsapp_instances')
      .select('instance_id, api_key')
      .eq('id', allocatedInstanceId)
      .single();
      
    if (newError || !newInstance) {
      throw new Error('Falha ao recuperar dados da instância');
    }
    
    return newInstance;
  }

  return instance;
}

export async function sendWhatsAppMessage({ phone, message }: WhatsAppMessage) {
  try {
    const instance = await getInstanceCredentials();

    const response = await fetch(`${WHATSAPP_API_URL}/message/send-text?instanceId=${instance.instance_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${instance.api_key}`
      },
      body: JSON.stringify({
        phone,
        message,
        delayMessage: 5
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function getQRCode() {
  try {
    const instance = await getInstanceCredentials();

    const response = await fetch(`${WHATSAPP_API_URL}/instance/qr-code?instanceId=${instance.instance_id}&image=enable`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get QR code');
    }

    const data = await response.json();
    return {
      qrCode: data.qrcode,
      instanceId: data.instanceId
    };
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
}

export async function checkConnectionStatus() {
  try {
    const instance = await getInstanceCredentials();

    const response = await fetch(`${WHATSAPP_API_URL}/instance/status-instance?instanceId=${instance.instance_id}`, {
      headers: {
        'Authorization': `Bearer ${instance.api_key}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }

    const data = await response.json();
    return {
      connected: data.connected,
      instanceId: data.instanceId
    };
  } catch (error) {
    console.error('Error checking connection status:', error);
    throw error;
  }
}
