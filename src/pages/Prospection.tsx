
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/providers/AuthProvider";
import { Lead } from "@/types/database";
import { Search, Filter, Building, Loader2, ArrowLeft, MoreHorizontal } from "lucide-react";

const Prospection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  const { 
    data: leads,
    isLoading: isLeadsLoading,
    fetchData: fetchLeads
  } = useSupabaseData<Lead>('leads', { 
    fetchOnMount: true,
    queryFilter: (query) => query.eq('user_id', user?.id || '')
  });

  const filteredLeads = leads?.filter(lead => 
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.cnae_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" asChild>
                <a href="/dashboard">
                  <ArrowLeft size={20} />
                </a>
              </Button>
              <h1 className="text-2xl font-semibold text-gray-800 ml-2">Prospecção</h1>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <CardTitle>Busca de Leads</CardTitle>
              <CardDescription>Encontre leads para sua próxima campanha</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos os Leads</TabsTrigger>
              <TabsTrigger value="new">Novos</TabsTrigger>
              <TabsTrigger value="contacted">Contatados</TabsTrigger>
              <TabsTrigger value="interested">Interessados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="bg-white rounded-md border">
                {isLeadsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                    <p className="text-gray-500">Carregando leads...</p>
                  </div>
                ) : filteredLeads?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Building className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhum lead encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Empresa</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Segmento</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Cidade</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Estado</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">Adicionado em</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLeads?.map((lead) => (
                          <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{lead.company_name}</td>
                            <td className="py-3 px-4 text-gray-500">{lead.cnae_description || "Não especificado"}</td>
                            <td className="py-3 px-4 text-gray-500">{lead.city || "Não especificado"}</td>
                            <td className="py-3 px-4 text-gray-500">{lead.state || "N/A"}</td>
                            <td className="py-3 px-4 text-gray-500">
                              {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <div className="bg-white rounded-md border p-8 text-center text-gray-500">
                Sem leads novos para exibir
              </div>
            </TabsContent>
            
            <TabsContent value="contacted" className="mt-0">
              <div className="bg-white rounded-md border p-8 text-center text-gray-500">
                Sem leads contatados para exibir
              </div>
            </TabsContent>
            
            <TabsContent value="interested" className="mt-0">
              <div className="bg-white rounded-md border p-8 text-center text-gray-500">
                Sem leads interessados para exibir
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Prospection;
