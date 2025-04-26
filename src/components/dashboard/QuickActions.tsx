
import { PlusCircle, Zap, ChevronRight, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  to: string;
  variant?: 'default' | 'secondary' | 'outline' | 'highlight';
}

const ActionCard = ({ icon, title, description, buttonText, buttonIcon, to, variant = 'default' }: ActionCardProps) => {
  const getBgColor = () => {
    switch (variant) {
      case 'highlight':
        return 'bg-primary/10 border-primary/20';
      case 'secondary':
        return 'bg-secondary/10 border-secondary/20';
      case 'outline':
        return 'bg-background border-muted';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${getBgColor()}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-medium">{title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>
            <Button asChild variant="secondary" size="sm" className="mt-2">
              <Link to={to} className="flex items-center">
                {buttonIcon || <ChevronRight className="mr-1 h-4 w-4" />}
                <span>{buttonText}</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <ActionCard
        icon={<PlusCircle className="h-6 w-6 text-primary" />}
        title="Nova Campanha"
        description="Crie uma nova campanha de prospecção em poucos cliques"
        buttonText="Criar Campanha"
        to="/campaigns/new"
        variant="highlight"
      />
      <ActionCard
        icon={<Zap className="h-6 w-6 text-amber-500" />}
        title="Leads Diários"
        description="3.218 novos leads disponíveis para prospecção hoje"
        buttonText="Ver Leads"
        to="/prospection"
      />
      <ActionCard
        icon={<BarChart2 className="h-6 w-6 text-blue-500" />}
        title="Análise de Campanhas"
        description="Veja os resultados e otimize suas próximas campanhas"
        buttonText="Ver Relatórios" 
        to="/reports"
      />
    </div>
  );
};
