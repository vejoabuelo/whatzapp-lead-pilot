
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, Search } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const LeadInsights = () => {
  const navigate = useNavigate();
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: leads, isLoading: leadsLoading } = useSupabaseData<Lead>('leads', { 
    fetchOnMount: true,
    queryFilter: (query) => query.order('created_at', { ascending: false }).limit(5)
  });
  
  useEffect(() => {
    if (leads) {
      setRecentLeads(leads);
      setIsLoading(false);
    }
  }, [leads]);
  
  const getOpeningDate = (date: string | null) => {
    if (!date) return 'Data não disponível';
    
    const openingDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - openingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aberta hoje';
    if (diffDays === 1) return 'Aberta ontem';
    if (diffDays < 7) return `Aberta há ${diffDays} dias`;
    if (diffDays < 30) return `Aberta há ${Math.floor(diffDays / 7)} semanas`;
    return `Aberta há ${Math.floor(diffDays / 30)} meses`;
  };
  
  // Simulated top segments
  const topSegments = [
    { name: 'Restaurantes', count: 834, percentage: 34 },
    { name: 'Clínicas', count: 621, percentage: 26 },
    { name: 'Lojas de Varejo', count: 549, percentage: 22 },
    { name: 'Academias', count: 276, percentage: 11 }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Empresas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-muted rounded-md">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-md hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <Building size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={lead.company_name}>
                      {lead.company_name}
                    </p>
                    <div className="flex items-center mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={lead.cnae_description || ''}>
                        {lead.cnae_description || 'Sem descrição'}
                      </span>
                      <span className="mx-1 text-gray-300">•</span>
                      <span className="text-xs text-muted-foreground">{lead.city}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {getOpeningDate(lead.opening_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2 flex items-center gap-2"
                onClick={() => navigate('/prospection')}
              >
                <Search size={16} />
                Ver mais empresas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Leads por Segmento</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {topSegments.map((segment) => (
              <div key={segment.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{segment.name}</span>
                  <span className="text-sm font-medium">{segment.count}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      segment.name === 'Restaurantes' ? 'bg-blue-500' :
                      segment.name === 'Clínicas' ? 'bg-green-500' :
                      segment.name === 'Lojas de Varejo' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`} 
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 mt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total de Leads</p>
                <p className="text-sm font-medium">2,458</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 flex items-center gap-2"
                onClick={() => navigate('/prospection')}
              >
                <TrendingUp size={16} />
                Explorar Segmentos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
