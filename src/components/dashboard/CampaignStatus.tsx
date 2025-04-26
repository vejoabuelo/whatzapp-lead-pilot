
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Clock, AlertTriangle, Send, Loader2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Campaign } from '@/types/database';
import { toast } from 'sonner';

export const CampaignStatus = () => {
  const navigate = useNavigate();
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');
  const [lastLead, setLastLead] = useState({
    company: 'Carregando...',
    message: 'Carregando...',
  });

  const { 
    data: campaigns,
    isLoading, 
    error 
  } = useSupabaseData<Campaign>('campaigns', {
    fetchOnMount: true,
    queryFilter: (query) => query.eq('status', 'active').limit(1)
  });

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      setActiveCampaign(campaigns[0]);
      // Simulação de progresso e tempo
      const randomProgress = Math.floor(Math.random() * 80) + 10;
      setProgress(randomProgress);
      
      const minutes = Math.floor(Math.random() * 30) + 5;
      const seconds = Math.floor(Math.random() * 60);
      setRemainingTime(`${minutes}min ${seconds}s`);
      
      // Simulação do último lead
      setLastLead({
        company: 'Restaurante Sabor Caseiro',
        message: 'Olá Restaurante Sabor Caseiro! Vi que vocês abriram recentemente em São Paulo. Nosso sistema de gestão é ideal para restaurantes, com módulos de pedidos, controle de estoque e delivery. Podemos conversar sobre como otimizar a operação?'
      });
    }
  }, [campaigns]);

  const handlePauseResume = () => {
    if (!activeCampaign) return;
    
    // Simulação de pausa/retomada
    const newStatus = activeCampaign.status === 'active' ? 'paused' : 'active';
    
    toast.success(newStatus === 'active' ? 'Campanha retomada' : 'Campanha pausada');
    setActiveCampaign({
      ...activeCampaign,
      status: newStatus as 'active' | 'paused' | 'draft' | 'completed'
    });
  };

  if (isLoading) {
    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-lg font-medium">
            <Send className="mr-2 h-5 w-5" />
            Carregando campanhas...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-destructive/10">
          <CardTitle className="flex items-center text-lg font-medium">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Erro ao carregar campanhas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4 text-muted-foreground">
            Não conseguimos carregar suas campanhas ativas. Por favor, tente novamente.
          </p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </CardContent>
      </Card>
    );
  }

  if (!activeCampaign) {
    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center text-lg font-medium">
            <Send className="mr-2 h-5 w-5" />
            Nenhuma campanha ativa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4 text-muted-foreground">
            Você não tem nenhuma campanha ativa no momento. Crie uma nova campanha para começar.
          </p>
          <Button onClick={() => navigate('/campaigns/new')}>
            Criar Nova Campanha
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className={`${activeCampaign.status === 'active' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
        <CardTitle className="flex items-center justify-between text-lg font-medium">
          <div className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            <span>Campanha em Execução: {activeCampaign.name}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/campaigns/${activeCampaign.id}`)}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Ver Detalhes
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso de Envio</span>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tempo restante: {remainingTime}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}% concluído</span>
            <span>256/324 leads</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Última Mensagem Enviada</h4>
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-medium">{lastLead.company}</p>
            <p className="mt-1 text-muted-foreground">{lastLead.message}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant={activeCampaign.status === 'active' ? 'outline' : 'default'}
            onClick={handlePauseResume}
            className="flex-1"
          >
            {activeCampaign.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pausar Campanha
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Retomar Campanha
              </>
            )}
          </Button>
          
          <Button variant="outline" className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Testar Envio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
