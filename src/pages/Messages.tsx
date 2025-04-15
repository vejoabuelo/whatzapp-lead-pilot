
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/dashboard/Sidebar";
import { useWhatsappConnections } from "@/hooks/useWhatsappConnections";
import { MessageSquare, Plus, Search, Filter, ArrowLeft, RefreshCcw, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { connections, isLoading, addConnection } = useWhatsappConnections();

  const handleAddConnection = async () => {
    const name = prompt("Nome da conexão:");
    if (name) {
      const result = await addConnection(name);
      if (result) {
        toast.success("Conexão adicionada com sucesso");
      }
    }
  };

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
              <h1 className="text-2xl font-semibold text-gray-800 ml-2">Mensagens</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCcw size={16} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <Button onClick={handleAddConnection} className="gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">Nova Conexão</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Conexões WhatsApp</CardTitle>
                  <CardDescription>Gerencie suas conexões de WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                      <p className="text-gray-500">Carregando conexões...</p>
                    </div>
                  ) : connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Smartphone className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-center mb-4">Nenhuma conexão de WhatsApp encontrada</p>
                      <Button onClick={handleAddConnection} variant="outline" className="gap-2">
                        <Plus size={16} />
                        <span>Adicionar Conexão</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connections.map((connection) => (
                        <div 
                          key={connection.id} 
                          className="p-4 border border-gray-200 rounded-md hover:border-blue-500 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium">{connection.name}</p>
                                <p className="text-xs text-gray-500">
                                  {connection.status === 'connected' 
                                    ? 'Conectado' 
                                    : 'Desconectado'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                connection.status === 'connected' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {connection.status === 'connected' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Conversas</CardTitle>
                  <CardDescription>Gerencie suas conversas com leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">Todas</TabsTrigger>
                      <TabsTrigger value="pending">Pendentes</TabsTrigger>
                      <TabsTrigger value="answered">Respondidas</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          placeholder="Buscar por conversa ou lead..."
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
                    
                    <TabsContent value="all" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-4">Nenhuma conversa encontrada</p>
                        <p className="text-sm text-gray-400 text-center max-w-md">
                          Conecte seu WhatsApp e inicie campanhas para ver conversas aqui
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="pending" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhuma conversa pendente</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="answered" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">Nenhuma conversa respondida</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
