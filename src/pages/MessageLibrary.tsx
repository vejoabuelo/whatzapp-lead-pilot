import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  MessageSquare,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import MessageService, { MessageCategory, MessageTemplate } from "@/services/messageService";

const MessageLibrary = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MessageCategory[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MessageCategory | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', segment: '' });
  const [newTemplate, setNewTemplate] = useState({ content: '', variables_used: [] as string[] });
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await MessageService.getCategories(user.id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadTemplates = useCallback(async (categoryId: string) => {
    try {
      const data = await MessageService.getTemplatesByCategory(categoryId);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Erro ao carregar templates');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory);
    }
  }, [selectedCategory, loadTemplates]);

  const handleCreateCategory = async () => {
    if (!user || !newCategory.name.trim()) return;
    
    try {
      await MessageService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        segment: newCategory.segment,
        user_id: user.id
      });
      
      await loadCategories();
      setShowCategoryDialog(false);
      setNewCategory({ name: '', description: '', segment: '' });
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      await MessageService.updateCategory(editingCategory.id, {
        name: newCategory.name,
        description: newCategory.description,
        segment: newCategory.segment
      });
      
      await loadCategories();
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', segment: '' });
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleCreateTemplate = async () => {
    if (!selectedCategory || !newTemplate.content.trim()) return;
    
    try {
      await MessageService.createTemplate({
        category_id: selectedCategory,
        content: newTemplate.content,
        variables_used: newTemplate.variables_used
      });
      
      await loadTemplates(selectedCategory);
      setShowTemplateDialog(false);
      setNewTemplate({ content: '', variables_used: [] });
      toast.success('Template criado com sucesso!');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erro ao criar template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      await MessageService.updateTemplate(editingTemplate.id, {
        content: newTemplate.content,
        variables_used: newTemplate.variables_used
      });
      
      if (selectedCategory) {
        await loadTemplates(selectedCategory);
      }
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setNewTemplate({ content: '', variables_used: [] });
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erro ao atualizar template');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await MessageService.deleteCategory(categoryId);
      await loadCategories();
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setTemplates([]);
      }
      toast.success('Categoria removida com sucesso!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao remover categoria');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await MessageService.deleteTemplate(templateId);
      if (selectedCategory) {
        await loadTemplates(selectedCategory);
      }
      toast.success('Template removido com sucesso!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao remover template');
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const handleTemplateContentChange = (content: string) => {
    const variables = extractVariables(content);
    setNewTemplate({ content, variables_used: variables });
  };

  const openEditCategory = (category: MessageCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      segment: category.segment || ''
    });
    setShowCategoryDialog(true);
  };

  const openEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      content: template.content,
      variables_used: template.variables_used || []
    });
    setShowTemplateDialog(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Mensagens</h1>
          <p className="text-gray-600 mt-2">Gerencie suas categorias e templates de mensagens</p>
        </div>
        <Button onClick={() => setShowCategoryDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma categoria encontrada</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowCategoryDialog(true)}
                  >
                    Criar primeira categoria
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {category.segment && (
                              <Badge variant="secondary" className="text-xs">
                                {category.segment}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              0 templates
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Templates de Mensagem
                </CardTitle>
                {selectedCategory && (
                  <Button onClick={() => setShowTemplateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Selecione uma categoria para ver os templates</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum template encontrado</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    Criar primeiro template
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap">{template.content}</p>
                          </div>
                          {template.variables_used && template.variables_used.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Variáveis:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.variables_used.map((variable) => (
                                  <Badge key={variable} variant="outline" className="text-xs">
                                    {`{{${variable}}}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>Usado {template.usage_count} vezes</span>
                            {template.response_rate && (
                              <span>Taxa de resposta: {(template.response_rate * 100).toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ex: Restaurantes"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Descrição da categoria..."
              />
            </div>
            <div>
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                value={newCategory.segment}
                onChange={(e) => setNewCategory({ ...newCategory, segment: e.target.value })}
                placeholder="Ex: Alimentação"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              {editingCategory ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Conteúdo da Mensagem</Label>
              <Textarea
                id="content"
                value={newTemplate.content}
                onChange={(e) => handleTemplateContentChange(e.target.value)}
                placeholder="Digite sua mensagem aqui... Use {{variavel}} para campos dinâmicos"
                className="min-h-32"
              />
            </div>
            {newTemplate.variables_used.length > 0 && (
              <div>
                <Label>Variáveis Detectadas</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {newTemplate.variables_used.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              {editingTemplate ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageLibrary;
