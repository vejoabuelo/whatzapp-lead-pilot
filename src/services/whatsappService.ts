
interface WhatsAppMessage {
  phone: string;
  message: string;
  delayMessage?: number;
}

export const WHATSAPP_API_URL = "https://api.w-api.app/v1";

export async function sendWhatsAppMessage({ phone, message }: WhatsAppMessage) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/message/send-text?instanceId=${import.meta.env.VITE_WHATSAPP_INSTANCE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        phone,
        message,
        delayMessage: 5 // 5 segundos de delay entre mensagens
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
    const response = await fetch(`${WHATSAPP_API_URL}/instance/qr-code?instanceId=${import.meta.env.VITE_WHATSAPP_INSTANCE_ID}&image=enable`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
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
    const response = await fetch(`${WHATSAPP_API_URL}/instance/status-instance?instanceId=${import.meta.env.VITE_WHATSAPP_INSTANCE_ID}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
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
