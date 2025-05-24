
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getQRCode, getPairingCode, checkConnectionStatus, forceDisconnectInstance, sendWhatsAppMessage } from '@/services/whatsappService';
import { useWhatsappConnections } from './useWhatsappConnections';
import { useWhatsappInstances } from './useWhatsappInstances';
import { useAuth } from '@/providers/AuthProvider';

export function useWhatsAppIntegration() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { updateConnection } = useWhatsappConnections();
  const { allocateInstance } = useWhatsappInstances();
  const { user } = useAuth();

  const startConnection = useCallback(async (connectionId: string, phoneNumber?: string) => {
    if (!user) return;
    
    setIsConnecting(true);
    setQrCode(null);
    setPairingCode(null);
    
    let statusCheck: NodeJS.Timeout;

    try {
      // Primeiro, aloca uma instância disponível para o usuário
      const instance = await allocateInstance(user.id);
      if (!instance) {
        throw new Error('Não foi possível alocar uma instância do WhatsApp');
      }

      // Força a desconexão da instância antes de tentar conectar
      await forceDisconnectInstance(instance.instance_id);

      // Atualiza o status para 'connecting' e associa a instância
      await updateConnection(connectionId, { 
        status: 'connecting',
        instance_id: instance.id
      });

      // Se forneceu número de telefone, tenta código de pareamento
      if (phoneNumber) {
        const { pairingCode: code } = await getPairingCode(phoneNumber);
        setPairingCode(code);
      } else {
        // Caso contrário, gera QR code
        const { qrCode: newQrCode } = await getQRCode();
        setQrCode(newQrCode);
      }
      
      // Inicia a verificação de status
      statusCheck = setInterval(async () => {
        try {
          const status = await checkConnectionStatus();
          if (status.connected) {
            clearInterval(statusCheck);
            setQrCode(null);
            setPairingCode(null);
            setIsConnecting(false);
            await updateConnection(connectionId, { status: 'connected' });
            toast.success('WhatsApp conectado com sucesso!');
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 5000);

      // Para a verificação após 2 minutos
      setTimeout(() => {
        clearInterval(statusCheck);
        if (isConnecting) {
          setIsConnecting(false);
          setQrCode(null);
          setPairingCode(null);
          updateConnection(connectionId, { 
            status: 'disconnected',
            instance_id: null
          });
          toast.error('Tempo de conexão expirado. Tente novamente.');
        }
      }, 120000);

    } catch (error) {
      console.error('Error starting WhatsApp connection:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar conexão com WhatsApp');
      setIsConnecting(false);
      setQrCode(null);
      setPairingCode(null);
      clearInterval(statusCheck!);
      
      // Se houver erro, garante que o status volta para desconectado
      await updateConnection(connectionId, { 
        status: 'disconnected',
        instance_id: null
      });
    }
  }, [updateConnection, allocateInstance, user, isConnecting]);

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
    pairingCode,
    isConnecting,
    startConnection,
    sendMessage
  };
}
