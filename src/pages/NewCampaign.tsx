
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/providers/AuthProvider";
import { Campaign } from "@/types/database";
import { startSimulatedCampaign } from "@/services/whatsappService";
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
  Loader2,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface Empresa {
  cnpj_basico: string;
  razao_social: string;
  nome_fantasia?: string;
  cnae_descricao?: string;
  municipio?: string;
  telefone_1?: string;
  situacao_cadastral?: string;
}

const NewCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leads");
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);
  
  const { 
    data: empresas,
    isLoading: isEmpresasLoading
  } = useSupabaseData<Empresa>('empresas', { 
    fetchOnMount: true
  });
  
  const { 
    addItem: addCampaign,
    isLoading: isAddingCampaign
  } = useSupabaseData<Campaign>('campaigns');

  const filteredEmpresas = empresas?.filter(empresa => 
    (empresa.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnae_descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.municipio?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    empresa.situacao_cadastral === 'ATIVA' &&
    empresa.telefone_1
  );

  const handleSelectEmpresa = (empresaCnpj: string) => {
    if (selectedEmpresas.includes(empresaCnpj)) {
      setSelectedEmpresas(selectedEmpresas.filter(cnpj => cnpj !== empresaCnpj));
    } else {
      setSelectedEmpresas([...selectedEmpresas, empresaCnpj]);
    }
  };

  const handleSelectAllEmpresas = () => {
    if (filteredEmpresas?.length === selectedEmpresas.length) {
      setSelectedEmpresas([]);
    } else {
      setSelectedEmpresas(filteredEmpresas?.map(empresa => empresa.cnpj_basico || '') || []);
    }
  };

  const handleCreateAndStartCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error("Forneça um nome para a campanha");
      return;
    }

    if (!message.trim()) {
      toast.error("Forneça uma mensagem para a campanha");
      return;
    }

    if (selectedEmpresas.length === 0) {
      toast.error("Selecione pelo menos uma empresa para a campanha");
      return;
    }

    setIsStartingCampaign(true);

    try {
      // Criar a campanha
      const newCampaign = await addCampaign({
        name: campaignName,
        user_id: user?.id,
        status: 'draft',
        description: `Campanha com ${selectedEmpresas.length} empresas selecionadas`
      });

      if (newCampaign && 'id' in newCampaign) {
        toast.success("Campanha criada! Iniciando envios simulados...");
        
        // Iniciar campanha simulada
        await startSimulatedCampaign(newCampaign.id, selectedEmpresas, message);
        
        navigate("/campaigns");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erro ao criar campanha");
    } finally {
      setIsStartingCampaign(false);
    }
  };

  const handleNextTab = () => {
    if (activeTab === "leads") {
      if (selectedEmpresas.length === 0) {
        toast.error("Selecione pelo menos uma empresa");
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
            <Badge variant="secondary" className="gap-2">
              <Zap size={14} />
              Modo Simulado
            </Badge>
          </div>
        </header>

        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Campanha</CardTitle>
              <CardDescription>
                Configure sua campanha de mensagens. No modo simulado, todas as mensagens são registradas mas não enviadas via WhatsApp real.
              </CardDescription>
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
                  <TabsTrigger value="leads">1. Selecionar Empresas</TabsTrigger>
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
                    {isEmpresasLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                        <p className="text-gray-500">Carregando empresas...</p>
                      </div>
                    ) : filteredEmpresas?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhuma empresa encontrada</p>
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
                                    checked={filteredEmpresas?.length === selectedEmpresas.length && filteredEmpresas?.length > 0}
                                    onChange={handleSelectAllEmpresas}
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
                            {filteredEmpresas?.map((empresa) => (
                              <tr key={empresa.cnpj_basico} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <input 
                                      type="checkbox" 
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                      checked={selectedEmpresas.includes(empresa.cnpj_basico || '')}
                                      onChange={() => handleSelectEmpresa(empresa.cnpj_basico || '')}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium">
                                  {empresa.nome_fantasia || empresa.razao_social}
                                </td>
                                <td className="py-3 px-4 text-gray-500">
                                  {empresa.cnae_descricao || "Não especificado"}
                                </td>
                                <td className="py-3 px-4 text-gray-500">
                                  {empresa.municipio || "Não especificado"}
                                </td>
                                <td className="py-3 px-4 text-gray-500">
                                  {empresa.telefone_1 || "Não informado"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      {selectedEmpresas.length} empresas selecionadas
                    </p>
                    <Button onClick={handleNextTab} className="gap-2" disabled={selectedEmpresas.length === 0}>
                      <span>Próximo</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="message" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Modo Simulado Ativo</h4>
                      <p className="text-sm text-blue-700">
                        Suas mensagens serão processadas e registradas, mas não enviadas via WhatsApp real. 
                        Perfeito para testar o sistema antes de assinar um plano.
                      </p>
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
                              <dt className="text-sm font-medium text-gray-500">Total de Empresas</dt>
                              <dd className="mt-1 text-sm flex items-center">
                                <Users size={14} className="mr-2" />
                                {selectedEmpresas.length} empresas selecionadas
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Modo de Envio</dt>
                              <dd className="mt-1 text-sm flex items-center">
                                <Zap size={14} className="mr-2" />
                                Simulado (para testes)
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
                            * Esta é uma prévia. As variáveis serão substituídas pelos dados das empresas no envio.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Resumo das Empresas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">
                          <span className="font-medium">{selectedEmpresas.length}</span> empresas selecionadas
                        </p>
                        <div className="bg-gray-100 p-4 rounded-md max-h-40 overflow-y-auto">
                          <ul className="text-sm space-y-1">
                            {isEmpresasLoading ? (
                              <p>Carregando...</p>
                            ) : (
                              empresas?.filter(empresa => selectedEmpresas.includes(empresa.cnpj_basico || ''))
                                .map(empresa => (
                                  <li key={empresa.cnpj_basico} className="flex items-center">
                                    <Check size={12} className="text-green-500 mr-2" />
                                    {empresa.nome_fantasia || empresa.razao_social} - {empresa.telefone_1}
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
                      onClick={handleCreateAndStartCampaign} 
                      disabled={isStartingCampaign || !campaignName.trim() || !message.trim() || selectedEmpresas.length === 0}
                      className="gap-2"
                    >
                      {isStartingCampaign && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Send size={16} />
                      <span>Criar e Iniciar Campanha</span>
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
