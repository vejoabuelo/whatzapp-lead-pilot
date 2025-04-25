import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/providers/AuthProvider";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  ArrowUp, 
  ArrowDown, 
  Send, 
  Search, 
  Clock, 
  TrendingUp, 
  Filter, 
  MoreHorizontal, 
  Building,
  PlusCircle,
  RefreshCcw,
  Bell,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Lead, Campaign } from "@/types/database";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile } = useAuth();
  const { userPlan, isLoading: isPlanLoading } = useUserPlan();
  const { 
    data: leads,
    isLoading: isLeadsLoading,
    fetchData: fetchLeads
  } = useSupabaseData<Lead>('leads', { fetchOnMount: true });
  
  const { 
    data: campaigns,
    isLoading: isCampaignsLoading,
    fetchData: fetchCampaigns
  } = useSupabaseData<Campaign>('campaigns', { 
    fetchOnMount: true,
    queryFilter: (query) => query.eq('user_id', user?.id || '')
  });

  const handleRefresh = () => {
    fetchLeads();
    fetchCampaigns();
    toast.success("Dados atualizados com sucesso");
  };

  const stats = [
    {
      title: "Total de Leads",
      value: leads?.length.toString() || "0",
      change: "+12.5%",
      changeType: "positive",
      icon: <Users className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Mensagens Enviadas",
      value: "1,892",
      change: "+18.2%",
      changeType: "positive",
      icon: <MessageSquare className="h-5 w-5 text-green-600" />
    },
    {
      title: "Taxa de Resposta",
      value: "8.7%",
      change: "-2.3%",
      changeType: "negative",
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />
    },
    {
      title: "Campanhas Ativas",
      value: campaigns?.filter(c => c.status === 'active').length.toString() || "0",
      change: "+1",
      changeType: "positive",
      icon: <Send className="h-5 w-5 text-purple-600" />
    }
  ];

  const recentLeads = leads?.slice(0, 5).map(lead => ({
    company: lead.company_name,
    segment: lead.cnae_description || "Não especificado",
    city: lead.city || "Não especificado",
    date: new Date(lead.created_at).toLocaleDateString('pt-BR'),
    status: "Novo"
  })) || [
    {
      company: "Academia Fitness Center",
      segment: "Academias",
      city: "São Paulo",
      date: "Hoje, 10:45",
      status: "Novo"
    },
    {
      company: "Restaurante Sabor Caseiro",
      segment: "Restaurantes",
      city: "Rio de Janeiro",
      date: "Hoje, 09:23",
      status: "Novo"
    },
    {
      company: "Clínica Saúde Total",
      segment: "Clínicas",
      city: "Belo Horizonte",
      date: "Ontem, 15:30",
      status: "Contato Feito"
    },
    {
      company: "Pet Shop Amigo Fiel",
      segment: "Pet Shops",
      city: "Curitiba",
      date: "Ontem, 11:15",
      status: "Interessado"
    },
    {
      company: "Salão Beleza Plena",
      segment: "Salões de Beleza",
      city: "Brasília",
      date: "22/05/2023",
      status: "Convertido"
    }
  ];

  const recentCampaigns = campaigns?.slice(0, 3).map(campaign => ({
    name: campaign.name,
    leads: 324,
    sent: 256,
    responses: 28,
    date: new Date(campaign.created_at).toLocaleDateString('pt-BR'),
    status: campaign.status === 'active' ? "Em andamento" : "Concluída"
  })) || [
    {
      name: "Restaurantes - São Paulo",
      leads: 324,
      sent: 256,
      responses: 28,
      date: "Hoje, 11:20",
      status: "Em andamento"
    },
    {
      name: "Clínicas - Novas Aberturas",
      leads: 156,
      sent: 156,
      responses: 14,
      date: "Ontem, 09:45",
      status: "Concluída"
    },
    {
      name: "Pet Shops - Brasil",
      leads: 522,
      sent: 489,
      responses: 41,
      date: "20/05/2023",
      status: "Concluída"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-100 text-blue-700";
      case "Contato Feito":
        return "bg-purple-100 text-purple-700";
      case "Interessado":
        return "bg-orange-100 text-orange-700";
      case "Convertido":
        return "bg-green-100 text-green-700";
      case "Em andamento":
        return "bg-yellow-100 text-yellow-700";
      case "Concluída":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Adicione isso temporariamente para debug
  console.log('Profile:', profile);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
                <RefreshCcw size={16} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
              </div>
              <Button className="gap-2">
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Nova Campanha</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-100">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {stat.changeType === "positive" ? (
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">em 30 dias</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Atividades Recentes</CardTitle>
                  <Tabs defaultValue="leads" className="w-full max-w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="leads">Leads</TabsTrigger>
                      <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="leads">
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Filter size={14} />
                              <span>Filtrar</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Clock size={14} />
                              <span>Últimos 7 dias</span>
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Search size={14} />
                            <span>Pesquisar</span>
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Segmento</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Cidade</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Data</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {isLeadsLoading ? (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    <p className="mt-2 text-sm text-gray-500">Carregando leads...</p>
                                  </td>
                                </tr>
                              ) : recentLeads.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center text-gray-500">
                                    Nenhum lead encontrado
                                  </td>
                                </tr>
                              ) : (
                                recentLeads.map((lead, index) => (
                                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4">{lead.company}</td>
                                    <td className="py-3 px-4 text-gray-500">{lead.segment}</td>
                                    <td className="py-3 px-4 text-gray-500">{lead.city}</td>
                                    <td className="py-3 px-4 text-gray-500">{lead.date}</td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal size={16} />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="campaigns">
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Filter size={14} />
                              <span>Filtrar</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Clock size={14} />
                              <span>Últimos 7 dias</span>
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Search size={14} />
                            <span>Pesquisar</span>
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Campanha</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Leads</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Envios</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Respostas</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Data</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {isCampaignsLoading ? (
                                <tr>
                                  <td colSpan={7} className="py-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    <p className="mt-2 text-sm text-gray-500">Carregando campanhas...</p>
                                  </td>
                                </tr>
                              ) : recentCampaigns.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="py-8 text-center text-gray-500">
                                    Nenhuma campanha encontrada
                                  </td>
                                </tr>
                              ) : (
                                recentCampaigns.map((campaign, index) => (
                                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="py-3 px-4">{campaign.name}</td>
                                    <td className="py-3 px-4 text-gray-500">{campaign.leads}</td>
                                    <td className="py-3 px-4 text-gray-500">{campaign.sent}</td>
                                    <td className="py-3 px-4 text-gray-500">{campaign.responses}</td>
                                    <td className="py-3 px-4 text-gray-500">{campaign.date}</td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                        {campaign.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal size={16} />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardHeader>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Resumo do Plano</CardTitle>
                <CardDescription>Utilização do seu plano atual</CardDescription>
              </CardHeader>
              <CardContent>
                {isPlanLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-gray-500">Carregando informações do plano...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">Leads Disponíveis</span>
                        </div>
                        <span className="text-sm font-medium">{leads?.length || 0} / {userPlan?.plan.leads_limit || 100}</span>
                      </div>
                      <Progress value={((leads?.length || 0) / (userPlan?.plan.leads_limit || 100)) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{leads?.length || 0} leads utilizados neste mês</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">Mensagens Restantes</span>
                        </div>
                        <span className="text-sm font-medium">20 / {userPlan?.plan.messages_limit || 50}</span>
                      </div>
                      <Progress value={(20 / (userPlan?.plan.messages_limit || 50)) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">30 mensagens enviadas neste mês</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Send className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">Campanhas Ativas</span>
                        </div>
                        <span className="text-sm font-medium">
                          {campaigns?.filter(c => c.status === 'active').length || 0} / {userPlan?.plan.campaigns_limit || 1}
                        </span>
                      </div>
                      <Progress 
                        value={((campaigns?.filter(c => c.status === 'active').length || 0) / (userPlan?.plan.campaigns_limit || 1)) * 100} 
                        className="h-2" 
                      />
                      {((campaigns?.filter(c => c.status === 'active').length || 0) >= (userPlan?.plan.campaigns_limit || 1)) ? (
                        <p className="text-xs text-gray-500 mt-1">Limite máximo atingido</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          {campaigns?.filter(c => c.status === 'active').length || 0} campanhas ativas
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button className="w-full">Fazer Upgrade</Button>
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Plano atual: <span className="font-medium">{userPlan?.plan.name || "Gratuito"}</span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Leads por Segmento</CardTitle>
                <CardDescription>Distribuição de leads disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Restaurantes</span>
                      <span className="text-sm font-medium">834</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "34%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Clínicas e Consultórios</span>
                      <span className="text-sm font-medium">621</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "26%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Lojas de Varejo</span>
                      <span className="text-sm font-medium">549</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Academias</span>
                      <span className="text-sm font-medium">276</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: "11%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Outros</span>
                      <span className="text-sm font-medium">178</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: "7%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total de Leads Disponíveis</p>
                    <p className="text-sm font-medium">{leads?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Leads por Localização</CardTitle>
                <CardDescription>Distribuição geográfica dos leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">São Paulo</span>
                      <span className="text-sm font-medium">
                        {leads?.filter(lead => lead.state === 'SP' || lead.city?.includes('São Paulo')).length || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "38%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Rio de Janeiro</span>
                      <span className="text-sm font-medium">
                        {leads?.filter(lead => lead.state === 'RJ' || lead.city?.includes('Rio de Janeiro')).length || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "24%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Belo Horizonte</span>
                      <span className="text-sm font-medium">
                        {leads?.filter(lead => lead.city?.includes('Belo Horizonte')).length || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: "14%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Brasília</span>
                      <span className="text-sm font-medium">
                        {leads?.filter(lead => lead.city?.includes('Brasília')).length || 0}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Outros</span>
                      <span className="text-sm font-medium">
                        {(leads?.length || 0) - 
                          (leads?.filter(lead => 
                            lead.state === 'SP' || 
                            lead.city?.includes('São Paulo') || 
                            lead.state === 'RJ' || 
                            lead.city?.includes('Rio de Janeiro') || 
                            lead.city?.includes('Belo Horizonte') || 
                            lead.city?.includes('Brasília')
                          ).length || 0)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: "12%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Search size={16} />
                    Ver todos os estados
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Empresas Recentes</CardTitle>
                <CardDescription>Últimas empresas adicionadas à base</CardDescription>
              </CardHeader>
              <CardContent>
                {isLeadsLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-gray-500">Carregando leads...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentLeads.slice(0, 4).map((lead, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                          <Building size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lead.company}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">{lead.segment}</span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{lead.city}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{lead.date}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <TrendingUp size={16} />
                    Ver mais empresas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Debug info - remova depois */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#f0f0f0', padding: 10, borderRadius: 5, zIndex: 9999 }}>
        <pre>
          {JSON.stringify({ 
            is_admin: profile?.is_admin,
            is_superadmin: profile?.is_superadmin
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Dashboard;
