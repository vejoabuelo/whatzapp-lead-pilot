
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Send,
  Eye,
  MousePointer
} from "lucide-react";
import { toast } from "sonner";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/providers/AuthProvider";
import ModernSidebar from "@/components/dashboard/ModernSidebar";
import type { MessageCategory, MessageTemplate } from "@/types/database";

const Messages = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<MessageCategory | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    addItem: addCategory,
    updateItem: updateCategory,
    deleteItem: deleteCategory,
    fetchData: fetchCategories 
  } = useSupabaseData<MessageCategory>("message_categories", {
    defaultData: [],
    fetchOnMount: true,
    queryFilter: (query) => query.eq('user_id', user?.id)
  });

  const { 
    data: templates, 
    isLoading: templatesLoading, 
    addItem: addTemplate,
    updateItem: updateTemplate,
    deleteItem: deleteTemplate,
    fetchData: fetchTemplates 
  } = useSupabaseData<MessageTemplate>("message_templates", {
    defaultData: [],
    fetchOnMount: true,
    queryFilter: (query) => selectedCategory ? query.eq('category_id', selectedCategory) : query
  });

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedCategory) {
      fetchTemplates();
    }
  }, [selectedCategory]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !user) return;

    try {
      await addCategory({
        name: newCategoryName,
        description: newCategoryDescription,
        user_id: user.id
      });
      setNewCategoryName("");
      setNewCategoryDescription("");
      toast.success("Categoria criada com sucesso!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateContent.trim() || !selectedCategory) return;

    try {
      await addTemplate({
        content: newTemplateContent,
        category_id: selectedCategory
      });
      setNewTemplateContent("");
      toast.success("Template criado com sucesso!");
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Erro ao criar template");
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Biblioteca de Mensagens</h1>
              <p className="text-gray-600">Organize suas mensagens por categorias e crie variações</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Categorias
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar categorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoriesLoading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Nenhuma categoria encontrada
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCategory === category.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {templates.filter(t => t.category_id === category.id).length}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}

                  {/* New Category Form */}
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Nome da categoria"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Descrição (opcional)"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        rows={2}
                      />
                      <Button 
                        onClick={handleCreateCategory}
                        className="w-full"
                        disabled={!newCategoryName.trim()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Categoria
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Templates */}
            <div className="lg:col-span-2">
              {selectedCategory ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Templates - {selectedCategoryData?.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {templates.filter(t => t.category_id === selectedCategory).length} templates
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Gerencie as variações de mensagem para esta categoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* New Template Form */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-4">
                      <Label>Nova Variação</Label>
                      <Textarea
                        placeholder="Digite sua mensagem aqui... Use {{empresa}}, {{cidade}}, {{segmento}} para personalização"
                        value={newTemplateContent}
                        onChange={(e) => setNewTemplateContent(e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                      <Button 
                        onClick={handleCreateTemplate}
                        className="mt-3"
                        disabled={!newTemplateContent.trim()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Template
                      </Button>
                    </div>

                    {/* Templates List */}
                    {templatesLoading ? (
                      <div className="text-center py-8">Carregando templates...</div>
                    ) : templates.filter(t => t.category_id === selectedCategory).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum template encontrado para esta categoria
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {templates.filter(t => t.category_id === selectedCategory).map((template) => (
                          <div key={template.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 mb-2">
                                  {template.content}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Send className="h-3 w-3" />
                                    {template.usage_count || 0} envios
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {template.response_rate || 0}% resposta
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTemplate(template)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma categoria
                    </h3>
                    <p className="text-gray-500 text-center">
                      Escolha uma categoria à esquerda para ver e gerenciar seus templates
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
