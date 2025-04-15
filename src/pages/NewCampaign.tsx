
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/providers/AuthProvider";
import { useWhatsappConnections } from "@/hooks/useWhatsappConnections";
import { Lead, Campaign } from "@/types/database";
import { 
  ArrowLeft, 
  Plus, 
  Send,
  Calendar,
  Users,
  MessageSquare,
  ChevronRight,
  Filter,
  Search,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const NewCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leads");
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    data: leads,
    isLoading: isLeadsLoading
  } = useSupabaseData<Lead>('leads', { 
    fetchOnMount: true
  });

  const { connections, isLoading: isConnectionsLoading } = useWhatsappConnections();
  
  const { 
    addItem: addCampaign,
    isLoading: isAddingCampaign
  } = useSupabaseData<Campaign>('campaigns');

  const filteredLeads = leads?.filter(lead => 
    (lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.cnae_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.city?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    lead.has_whatsapp
  );

  const handleSelectLead = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAllLeads = () => {
    if (filteredLeads?.length === selectedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads?.map(lead => lead.id) || []);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error("Forneça um nome para a campanha");
      return;
    }

    if (!message.trim()) {
      toast.error("Forneça uma mensagem para a campanha");
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error("Selecione pelo menos um lead para a campanha");
      return;
    }

    if (connections.length === 0 || !connections.some(c => c.status === 'connected')) {
      toast.error("Conecte pelo menos uma conta de WhatsApp");
      return;
    }

    try {
      const newCampaign = await addCampaign({
        name: campaignName,
        user_id: user?.id,
        status: 'draft',
        min_delay: 12,
        max_delay: 45
      });

      if (newCampaign) {
        toast.success("Campanha criada com sucesso!");
        navigate("/campaigns");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erro ao criar campanha");
    }
  };

  const handleNextTab = () => {
    if (activeTab === "leads") {
      if (selectedLeads.length === 0) {
        toast.error("Selecione pelo menos um lead");
        return;
      }
      setActiveTab("message");
    } else if (activeTab === "message") {
      if (!message.trim()) {
        toast.error("Forneça uma mensagem para a campanha");
        return;
      }
      setActiveTab("review");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "message") {
      setActiveTab("leads");
    } else if (activeTab === "review") {
      setActiveTab("message");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-2xl font-semibold text-gray-800 ml-2">Nova Campanha</h1>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Campanha</CardTitle>
              <CardDescription>Configure sua campanha de mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input 
                  id="campaign-name" 
                  placeholder="Ex: Black Friday - Restaurantes" 
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 grid grid-cols-3">
                  <TabsTrigger value="leads">1. Selecionar Leads</TabsTrigger>
                  <TabsTrigger value="message">2. Escrever Mensagem</TabsTrigger>
                  <TabsTrigger value="review">3. Revisar e Enviar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="leads" className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <Input
                        placeholder="Buscar por empresa, segmento ou cidade..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Filter size={16} />
                      <span>Filtros</span>
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-md border">
                    {isLeadsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                        <p className="text-gray-500">Carregando leads...</p>
                      </div>
                    ) : filteredLeads?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhum lead encontrado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4">
                                <div className="flex items-center">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    checked={filteredLeads?.length === selectedLeads.length && filteredLeads?.length > 0}
                                    onChange={handleSelectAllLeads}
                                  />
                                </div>
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Segmento</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Cidade</th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Telefone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLeads?.map((lead) => (
                              <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <input 
                                      type="checkbox" 
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                      checked={selectedLeads.includes(lead.id)}
                                      onChange={() => handleSelectLead(lead.id)}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium">{lead.company_name}</td>
                                <td className="py-3 px-4 text-gray-500">{lead.cnae_description || "Não especificado"}</td>
                                <td className="py-3 px-4 text-gray-500">{lead.city || "Não especificado"}</td>
                                <td className="py-3 px-4 text-gray-500">{lead.phone_number}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      {selectedLeads.length} leads selecionados
                    </p>
                    <Button onClick={handleNextTab} className="gap-2" disabled={selectedLeads.length === 0}>
                      <span>Próximo</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="message" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="whatsapp-connection">Conexão WhatsApp</Label>
                      <Select disabled={connections.length === 0}>
                        <SelectTrigger>
                          <SelectValue placeholder={isConnectionsLoading ? "Carregando..." : (connections.length === 0 ? "Nenhuma conexão disponível" : "Selecione uma conexão")} />
                        </SelectTrigger>
                        <SelectContent>
                          {connections.map((connection) => (
                            <SelectItem key={connection.id} value={connection.id}>
                              {connection.name} {connection.status === 'connected' ? '(Conectado)' : '(Desconectado)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {connections.length === 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          Você precisa adicionar e conectar pelo menos uma conta de WhatsApp.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="message-template">Modelo de Mensagem</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo ou crie uma nova mensagem" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Criar nova mensagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="message-content">Mensagem</Label>
                      <Textarea 
                        id="message-content" 
                        placeholder="Digite sua mensagem... Use {nome} para incluir o nome da empresa" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 min-h-[200px]"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Variáveis disponíveis: {"{nome}"} - Nome da empresa, {"{cidade}"} - Cidade, {"{segmento}"} - Segmento
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Voltar
                    </Button>
                    <Button onClick={handleNextTab} className="gap-2" disabled={!message.trim()}>
                      <span>Próximo</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="review" className="space-y-4">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Detalhes da Campanha</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Nome da Campanha</dt>
                              <dd className="mt-1 text-sm">{campaignName || "Não definido"}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Total de Leads</dt>
                              <dd className="mt-1 text-sm flex items-center">
                                <Users size={14} className="mr-2" />
                                {selectedLeads.length} leads selecionados
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Agendamento</dt>
                              <dd className="mt-1 text-sm flex items-center">
                                <Calendar size={14} className="mr-2" />
                                Envio imediato
                              </dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Prévia da Mensagem</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm whitespace-pre-line">{message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            * Esta é uma prévia. As variáveis serão substituídas pelos dados dos leads no envio.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Resumo dos Leads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">
                          <span className="font-medium">{selectedLeads.length}</span> leads selecionados
                        </p>
                        <div className="bg-gray-100 p-4 rounded-md max-h-40 overflow-y-auto">
                          <ul className="text-sm space-y-1">
                            {isLeadsLoading ? (
                              <p>Carregando...</p>
                            ) : (
                              leads?.filter(lead => selectedLeads.includes(lead.id))
                                .map(lead => (
                                  <li key={lead.id} className="flex items-center">
                                    <Check size={12} className="text-green-500 mr-2" />
                                    {lead.company_name} - {lead.phone_number}
                                  </li>
                                ))
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleCreateCampaign} 
                      disabled={isAddingCampaign || !campaignName.trim() || !message.trim() || selectedLeads.length === 0}
                      className="gap-2"
                    >
                      {isAddingCampaign && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Send size={16} />
                      <span>Criar Campanha</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default NewCampaign;
