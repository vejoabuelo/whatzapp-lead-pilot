
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWhatsappInstances } from "@/hooks/useWhatsappInstances";
import { 
  Server, 
  Plus, 
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Edit,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SuperAdminInstances = () => {
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newInstanceId, setNewInstanceId] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newHost, setNewHost] = useState("https://api.z-api.io");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { instances, isLoading, addInstance, updateInstance, deleteInstance } = useWhatsappInstances();

  const handleCreateInstance = async () => {
    if (!newInstanceName || !newInstanceId || !newApiKey) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      await addInstance({
        name: newInstanceName,
        instance_id: newInstanceId,
        api_key: newApiKey,
        host: newHost,
        is_available: true,
        max_free_users: 5,
        current_free_users: 0
      });
      
      setNewInstanceName("");
      setNewInstanceId("");
      setNewApiKey("");
      setNewHost("https://api.z-api.io");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating instance:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleAvailability = async (instanceId: string, currentStatus: boolean) => {
    try {
      await updateInstance(instanceId, { is_available: !currentStatus });
    } catch (error) {
      console.error("Error updating instance:", error);
    }
  };

  const handleDeleteInstance = async (instanceId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta instância?")) {
      try {
        await deleteInstance(instanceId);
      } catch (error) {
        console.error("Error deleting instance:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Instâncias WhatsApp</h1>
          <p className="text-gray-600">Gerencie as instâncias do WhatsApp para o sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Instância</DialogTitle>
              <DialogDescription>
                Configure uma nova instância do WhatsApp para o sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instance-name">Nome da Instância</Label>
                <Input
                  id="instance-name"
                  placeholder="Ex: Instância Principal"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance-id">ID da Instância</Label>
                <Input
                  id="instance-id"
                  placeholder="Ex: 12345"
                  value={newInstanceId}
                  onChange={(e) => setNewInstanceId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">Chave da API</Label>
                <Input
                  id="api-key"
                  placeholder="Ex: ABC123XYZ"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="host">Host da API</Label>
                <Input
                  id="host"
                  placeholder="https://api.z-api.io"
                  value={newHost}
                  onChange={(e) => setNewHost(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateInstance} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Instância
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span>Carregando instâncias...</span>
            </CardContent>
          </Card>
        ) : instances.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Server className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma instância encontrada</h3>
              <p className="text-gray-500 text-center mb-4">
                Crie uma nova instância do WhatsApp para começar a gerenciar conexões
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Instância
              </Button>
            </CardContent>
          </Card>
        ) : (
          instances.map((instance) => (
            <Card key={instance.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Server className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{instance.name}</CardTitle>
                      <CardDescription>ID: {instance.instance_id}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {instance.is_available ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disponível
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Indisponível
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleToggleAvailability(instance.id, instance.is_available)}
                        >
                          {instance.is_available ? "Marcar como Indisponível" : "Marcar como Disponível"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteInstance(instance.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Usuários: {instance.current_free_users || 0}/{instance.max_free_users || 5}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Host:</span> {instance.host}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">API Key:</span> {instance.api_key.substring(0, 8)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SuperAdminInstances;
