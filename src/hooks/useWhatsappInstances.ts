
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWhatsappInstances() {
  const [isAllocating, setIsAllocating] = useState(false);

  const allocateInstance = async (userId: string) => {
    setIsAllocating(true);
    try {
      const { data, error } = await supabase.rpc(
        'allocate_whatsapp_instance',
        { user_id: userId }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error allocating WhatsApp instance:', error);
      toast.error('Não foi possível alocar uma instância do WhatsApp');
      return null;
    } finally {
      setIsAllocating(false);
    }
  };

  return {
    isAllocating,
    allocateInstance
  };
}
