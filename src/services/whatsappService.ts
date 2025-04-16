
interface WhatsAppMessage {
  phone: string;
  message: string;
  delayMessage?: number;
}

export const WHATSAPP_API_URL = "https://api.w-api.app/v1";

async function getInstanceCredentials() {
  const { data: instance } = await supabase
    .from('whatsapp_instances')
    .select('instance_id, api_key')
    .eq('current_user_id', supabase.auth.user()?.id)
    .single();
  
  if (!instance) {
    throw new Error('Nenhuma instância do WhatsApp disponível');
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
