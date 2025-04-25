import { supabase } from '@/integrations/supabase/client';
import { variarMensagem, gerarDelayHumano } from './messageUtils';
import type { Campaign, CampaignLead, WhatsappInstance } from '@/types/database';
import { toast } from 'sonner';

// No ambiente Vite/React, usamos import.meta.env ao invés de process.env
const WAPI_BASE_URL = import.meta.env.VITE_WAPI_URL || 'https://painel.w-api.app';

interface WhatsAppMessage {
  phone: string;
  message: string;
  delayMessage?: number;
  shouldVaryMessage?: boolean;
}

export async function getInstanceCredentials(): Promise<WhatsappInstance> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Primeiro tenta buscar uma instância já alocada
    const { data: instance, error } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('current_user_id', session.user.id)
      .single()
      .returns<WhatsappInstance>();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Se não encontrou instância, tenta alocar uma nova
    if (!instance) {
      const { data: allocatedInstance, error: allocError } = await supabase
        .rpc('allocate_whatsapp_instance', { user_id: session.user.id })
        .returns<WhatsappInstance>();

      if (allocError) {
        throw new Error('Não foi possível alocar uma instância do WhatsApp');
      }

      if (!allocatedInstance) {
        throw new Error('Nenhuma instância do WhatsApp disponível');
      }

      return allocatedInstance;
    }

    return instance;
  } catch (error) {
    console.error('[getInstanceCredentials] Error:', error);
    throw error;
  }
}

export async function podeDesconectarUsuario(userId: string): Promise<boolean> {
  // Verifica se existem campanhas ativas
  const { count: campanhasAtivas } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  // Também verifica se há mensagens pendentes
  const { count: mensagensPendentes } = await supabase
    .from('campaign_leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .eq('user_id', userId);

  // Só pode desconectar se não tiver campanhas ativas nem mensagens pendentes
  return (campanhasAtivas || 0) === 0 && (mensagensPendentes || 0) === 0;
}

export async function disconnectInstance(instanceId: string, apiKey: string) {
  try {
    // Primeiro verifica se pode desconectar
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    const podeDesconectar = await podeDesconectarUsuario(session.user.id);
    if (!podeDesconectar) {
      toast.error('Não é possível desconectar enquanto houver campanhas ativas');
      return false;
    }

    // Primeiro desconecta a instância
    const disconnectResponse = await fetch(`${WAPI_BASE_URL}/instance/disconnect?instanceId=${instanceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!disconnectResponse.ok) {
      console.error('Failed to disconnect instance:', await disconnectResponse.text());
      toast.error('Falha ao desconectar a instância na W-API.');
      return false;
    }

    // Depois limpa o webhook
    const webhookResponse = await fetch(`${WAPI_BASE_URL}/webhook/update-webhook-connected?instanceId=${instanceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: ''
      })
    });

    if (!webhookResponse.ok) {
      console.warn('Failed to clear webhook:', await webhookResponse.text());
    }

    // Por fim, reinicia a instância
    const restartResponse = await fetch(`${WAPI_BASE_URL}/instance/restart?instanceId=${instanceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!restartResponse.ok) {
      console.warn('Failed to restart instance:', await restartResponse.text());
    }

    return true;
  } catch (error) {
    console.error('Error in disconnectInstance:', error);
    toast.error('Erro ao desconectar a instância');
    return false;
  }
}

export async function getPairingCode(phoneNumber: string) {
  const instance = await getInstanceCredentials();
  
  // Primeiro configura o webhook
  await fetch(`${WAPI_BASE_URL}/webhook/update-webhook-connected?instanceId=${instance.instance_id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${instance.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: `${window.location.origin}/api/webhooks/whatsapp/connected`
    })
  });
  
  // Gera o código de pareamento
  const response = await fetch(
    `${WAPI_BASE_URL}/instance/pairing-code?instanceId=${instance.instance_id}&phoneNumber=${phoneNumber}&syncContacts=disable`, 
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get pairing code');
  }

  const data = await response.json();
  return {
    pairingCode: data.pairingCode,
    instanceId: data.instanceId
  };
}

export async function checkInstanceAvailability(instanceId: string): Promise<boolean> {
  try {
    const { data: instance, error } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('instance_id', instanceId)
      .single();

    if (error) {
      console.error('Error checking instance availability:', error);
      return false;
    }

    return instance.is_available && (!instance.current_user_id || instance.current_free_users < instance.max_free_users);
  } catch (error) {
    console.error('Error in checkInstanceAvailability:', error);
    return false;
  }
}

export async function forceDisconnectInstance(instanceId: string): Promise<boolean> {
  try {
    // Busca a instância no banco
    const { data: instance, error } = await supabase
      .from('whatsapp_instances')
      .select('*')
      .eq('instance_id', instanceId)
      .single();

    if (error || !instance) {
      console.error('Error fetching instance:', error);
      return false;
    }

    // Tenta desconectar na API
    const response = await fetch(`${WAPI_BASE_URL}/instance/disconnect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceId: instance.instance_id
      })
    });

    if (!response.ok) {
      console.error('Failed to logout instance:', await response.text());
    }

    // Atualiza o status no banco
    const { error: updateError } = await supabase
      .from('whatsapp_instances')
      .update({
        current_user_id: null,
        current_free_users: Math.max(0, instance.current_free_users - 1)
      })
      .eq('id', instance.id);

    if (updateError) {
      console.error('Error updating instance:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in forceDisconnectInstance:', error);
    return false;
  }
}

export async function getQRCode() {
  try {
    const instance = await getInstanceCredentials();
    
    if (!instance || !instance.instance_id || !instance.api_key) {
      console.error('Instance credentials are invalid:', {
        hasInstance: !!instance,
        instanceId: instance?.instance_id,
        hasApiKey: !!instance?.api_key
      });
      throw new Error('Credenciais da instância inválidas');
    }

    // Verifica se a instância está disponível
    const isAvailable = await checkInstanceAvailability(instance.instance_id);
    if (!isAvailable) {
      // Tenta forçar a desconexão
      const disconnected = await forceDisconnectInstance(instance.instance_id);
      if (!disconnected) {
        throw new Error('Não foi possível liberar a instância');
      }
    }

    console.log('Tentando obter QR code para instância:', {
      instanceId: instance.instance_id,
      apiKey: instance.api_key.substring(0, 10) + '...'
    });

    // Configura o webhook
    const webhookUrl = `${WAPI_BASE_URL}/instance/webhook`;
    const webhookBody = {
      instanceId: instance.instance_id,
      webhookUrl: `${window.location.origin}/api/webhooks/whatsapp/connected`,
      events: ['messages.upsert', 'connection.update']
    };

    console.log('Configurando webhook:', {
      url: webhookUrl,
      body: webhookBody
    });

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookBody)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('Webhook configuration failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        url: webhookUrl,
        error: errorText
      });
      throw new Error('Falha ao configurar webhook');
    }

    // Gera um novo QR code
    const qrCodeUrl = `${WAPI_BASE_URL}/instance/qr`;
    const qrCodeBody = {
      instanceId: instance.instance_id
    };

    console.log('Obtendo QR code:', { 
      url: qrCodeUrl,
      body: qrCodeBody
    });

    const response = await fetch(qrCodeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrCodeBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('QR code fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        instanceId: instance.instance_id,
        url: qrCodeUrl,
        error: errorText
      });
      throw new Error(`Failed to get QR code: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      qrCode: data.qrcode.base64,
      instanceId: instance.instance_id
    };
  } catch (error) {
    console.error('Error in getQRCode:', error);
    throw error;
  }
}

export async function checkConnectionStatus() {
  try {
    const instance = await getInstanceCredentials();
    
    const response = await fetch(`${WAPI_BASE_URL}/instance/status-instance?instanceId=${instance.instance_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${instance.api_key}`
      }
    });

    if (!response.ok) {
      // Se a resposta não for ok, libera a instância
      await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: null,
          current_free_users: Math.max(0, instance.current_free_users - 1)
        })
        .eq('id', instance.id);
        
      throw new Error('Failed to check connection status');
    }

    const data = await response.json();
    
    // Se não estiver conectado, libera a instância
    if (!data.connected) {
      await supabase
        .from('whatsapp_instances')
        .update({
          current_user_id: null,
          current_free_users: Math.max(0, instance.current_free_users - 1)
        })
        .eq('id', instance.id);
    }
    
    return {
      connected: data.connected,
      instanceId: data.instanceId
    };
  } catch (error) {
    console.error('[checkConnectionStatus] Error:', error);
    throw error;
  }
}

export async function sendWhatsAppMessage({ phone, message, delayMessage, shouldVaryMessage = true }: WhatsAppMessage) {
  const instance = await getInstanceCredentials();
  
  // Varia a mensagem se necessário
  const mensagemFinal = shouldVaryMessage ? variarMensagem(message) : message;
  
  // Gera delay humano se não foi especificado
  const delayFinal = delayMessage ?? gerarDelayHumano(mensagemFinal);
  
  const response = await fetch(`${WAPI_BASE_URL}/messages/send?instanceId=${instance.instance_id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${instance.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone,
      message: mensagemFinal,
      delayMessage: delayFinal
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}
