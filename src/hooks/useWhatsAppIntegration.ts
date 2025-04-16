
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getQRCode, checkConnectionStatus, sendWhatsAppMessage } from '@/services/whatsappService';
import { useWhatsappConnections } from './useWhatsappConnections';

export function useWhatsAppIntegration() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { updateConnection } = useWhatsappConnections();

  const startConnection = useCallback(async (connectionId: string) => {
    setIsConnecting(true);
    try {
      const { qrCode: newQrCode, instanceId } = await getQRCode();
      setQrCode(newQrCode);
      
      // Start polling for connection status
      const statusCheck = setInterval(async () => {
        const status = await checkConnectionStatus();
        if (status.connected) {
          clearInterval(statusCheck);
          setQrCode(null);
          setIsConnecting(false);
          await updateConnection(connectionId, { 
            status: 'connected',
            connected_at: new Date().toISOString() // Using connected_at which should exist in the type
          });
          toast.success('WhatsApp conectado com sucesso!');
        }
      }, 5000);

      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(statusCheck);
        if (isConnecting) {
          setIsConnecting(false);
          setQrCode(null);
          toast.error('Tempo de conexão expirado. Tente novamente.');
        }
      }, 120000);

    } catch (error) {
      console.error('Error starting WhatsApp connection:', error);
      toast.error('Erro ao iniciar conexão com WhatsApp');
      setIsConnecting(false);
    }
  }, [updateConnection]);

  const sendMessage = useCallback(async (phone: string, message: string) => {
    try {
      const response = await sendWhatsAppMessage({ phone, message });
      toast.success('Mensagem enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
      return false;
    }
  }, []);

  return {
    qrCode,
    isConnecting,
    startConnection,
    sendMessage
  };
}
