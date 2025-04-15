
interface WhatsAppMessage {
  phone: string;
  message: string;
}

export const WHATSAPP_API_URL = "https://api.wppconnect.io/"; // Base URL for the API

export async function sendWhatsAppMessage({ phone, message }: WhatsAppMessage) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
      },
      body: JSON.stringify({
        phone,
        message,
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
    const response = await fetch(`${WHATSAPP_API_URL}/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get QR code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
}

export async function checkConnectionStatus(sessionId: string) {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/status/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking connection status:', error);
    throw error;
  }
}
