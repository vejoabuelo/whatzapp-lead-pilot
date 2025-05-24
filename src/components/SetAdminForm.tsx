
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SetAdminForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, informe o email do usuário');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, find the user by email in auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      const user = userData.users.find(u => u.email === email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Update the profile to set as admin
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success(`Usuário ${email} definido como administrador com sucesso`);
      setEmail('');
    } catch (error) {
      console.error('Erro ao definir usuário como admin:', error);
      toast.error('Falha ao definir usuário como administrador');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir Administrador</CardTitle>
        <CardDescription>Transforme um usuário existente em administrador do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email do Usuário</label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processando...' : 'Definir como Administrador'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SetAdminForm;
