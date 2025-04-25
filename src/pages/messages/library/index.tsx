import { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { messageService, MessageCategory, MessageTemplate } from '@/services/messageService';
import { useUser } from '@/hooks/useUser';

export default function MessageLibraryPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<MessageCategory[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // Estados para formulários
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newTemplate, setNewTemplate] = useState({ 
    content: '', 
    category_id: ''
  });
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Carregar categorias na inicialização
  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  // Carregar mensagens quando uma categoria for selecionada
  useEffect(() => {
    if (selectedCategory && user) {
      loadMessagesByCategory(selectedCategory);
    }
  }, [selectedCategory, user]);

  // Função para carregar categorias
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await messageService.getCategories();
      setCategories(data);
      
      // Se tiver categorias, seleciona a primeira automaticamente
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error: any) {
      if (error.message === 'Usuário não autenticado') {
        router.push('/auth/login');
        return;
      }
      
      console.error('Erro ao carregar categorias:', error.message);
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Função para carregar mensagens por categoria
  const loadMessagesByCategory = async (categoryId: string) => {
    setIsLoadingTemplates(true);
    try {
      const data = await messageService.getTemplatesByCategory(categoryId);
      setTemplates(data);
    } catch (error: any) {
      if (error.message === 'Usuário não autenticado') {
        router.push('/auth/login');
        return;
      }
      
      console.error('Erro ao carregar mensagens:', error.message);
      toast({
        title: 'Erro ao carregar mensagens',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Função para criar nova categoria
  const createCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast({
          title: 'Nome obrigatório',
          description: 'O nome da categoria é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      await messageService.createCategory({
        name: newCategory.name
      });
      
      toast({
        title: 'Categoria criada',
        description: 'Categoria criada com sucesso!'
      });
      
      // Recarregar categorias e fechar o diálogo
      loadCategories();
      setNewCategoryOpen(false);
      setNewCategory({ name: '' });
    } catch (error: any) {
      if (error.message === 'Usuário não autenticado') {
        router.push('/auth/login');
        return;
      }
      
      console.error('Erro ao criar categoria:', error.message);
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Função para excluir categoria
  const deleteCategory = async (categoryId: string) => {
    try {
      await messageService.deleteCategory(categoryId);
      toast({
        title: 'Categoria excluída',
        description: 'Categoria excluída com sucesso!'
      });
      loadCategories();
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setTemplates([]);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Função para excluir mensagem
  const deleteTemplate = async (templateId: string) => {
    try {
      if (!selectedCategory) return;
      await messageService.deleteTemplate(templateId, selectedCategory);
      toast({
        title: 'Mensagem excluída',
        description: 'Mensagem excluída com sucesso!'
      });
      loadMessagesByCategory(selectedCategory);
      loadCategories(); // Atualiza contagem de mensagens
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir mensagem',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Função para editar mensagem
  const editMessage = async () => {
    try {
      if (!editingTemplate || !editingTemplate.content.trim()) {
        toast({
          title: 'Conteúdo obrigatório',
          description: 'O conteúdo da mensagem é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      await messageService.updateTemplate(editingTemplate.id, {
        content: editingTemplate.content,
        category_id: editingTemplate.category_id
      });
      
      toast({
        title: 'Mensagem atualizada',
        description: 'Mensagem atualizada com sucesso!'
      });
      
      if (selectedCategory) {
        loadMessagesByCategory(selectedCategory);
      }
      setNewTemplateOpen(false);
      setEditingTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar mensagem',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Função para criar nova mensagem (simplificada)
  const createMessage = async () => {
    try {
      if (!newTemplate.content.trim()) {
        toast({
          title: 'Conteúdo obrigatório',
          description: 'O conteúdo da mensagem é obrigatório',
          variant: 'destructive'
        });
        return;
      }

      const categoryId = newTemplate.category_id || selectedCategory;
      if (!categoryId) {
        toast({
          title: 'Categoria obrigatória',
          description: 'Selecione uma categoria para a mensagem',
          variant: 'destructive'
        });
        return;
      }

      await messageService.createTemplate({
        content: newTemplate.content,
        category_id: categoryId,
        name: 'Template', // Nome padrão
        description: null // Sem descrição
      });
      
      toast({
        title: 'Mensagem criada',
        description: 'Mensagem criada com sucesso!'
      });
      
      if (selectedCategory) {
        loadMessagesByCategory(selectedCategory);
      }
      loadCategories();
      setNewTemplateOpen(false);
      setNewTemplate({ content: '', category_id: '' });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar mensagem',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Biblioteca de Mensagens</h1>
        <div className="flex gap-2">
          <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ name: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewCategoryOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createCategory}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Mensagem' : 'Nova Mensagem'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template-category" className="text-right">
                    Categoria
                  </Label>
                  <select 
                    id="template-category" 
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingTemplate ? editingTemplate.category_id : (newTemplate.category_id || selectedCategory || '')}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({...editingTemplate, category_id: e.target.value});
                      } else {
                        setNewTemplate({ ...newTemplate, category_id: e.target.value });
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="template-content" className="text-right">
                    Mensagem
                  </Label>
                  <Textarea
                    id="template-content"
                    value={editingTemplate ? editingTemplate.content : newTemplate.content}
                    onChange={(e) => {
                      if (editingTemplate) {
                        setEditingTemplate({...editingTemplate, content: e.target.value});
                      } else {
                        setNewTemplate({ ...newTemplate, content: e.target.value });
                      }
                    }}
                    className="col-span-3 min-h-[150px]"
                    placeholder="Digite sua mensagem aqui. Use {{variavel}} para adicionar variáveis dinâmicas."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setNewTemplateOpen(false);
                  setEditingTemplate(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={editingTemplate ? editMessage : createMessage}>
                  {editingTemplate ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <p>Carregando categorias...</p>
              ) : (
                <div className="flex flex-col space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Button
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="justify-start flex-1"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                          <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                            {category.message_count || 0}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory(category.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <p className="text-muted-foreground">Selecione uma categoria para ver as mensagens.</p>
              ) : isLoadingTemplates ? (
                <p>Carregando mensagens...</p>
              ) : (
                <div className="space-y-4">
                  {templates.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma mensagem encontrada nesta categoria.</p>
                  ) : (
                    templates.map((template) => (
                      <Card key={template.id} className="p-4">
                        <div className="flex justify-end mb-2 gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTemplate(template);
                              setNewTemplateOpen(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTemplate(template.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                          {template.content}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 