import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Send,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { Empresa, MessageCategory } from '@/types/database';
import MessageService from '@/services/messageService';

const Prospection = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresas, setSelectedEmpresas] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    uf: '',
    municipio: '',
    situacao_cadastral: '',
    cnae_fiscal: '',
    porte: ''
  });
  const [showQuickCampaign, setShowQuickCampaign] = useState(false);
  const [categories, setCategories] = useState<MessageCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [message, setMessage] = useState('');

  const { data: prospectionData } = useSupabaseData<Empresa>('empresas', {
    fetchOnMount: true
  });

  useEffect(() => {
    if (prospectionData) {
      setEmpresas(prospectionData);
      setFilteredEmpresas(prospectionData);
    }
  }, [prospectionData]);

  const loadCategories = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await MessageService.getCategories(user.id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [user]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleQuickCampaign = async () => {
    if (!user || selectedEmpresas.size === 0) return;
    
    try {
      let categoryId = selectedCategory;
      
      if (!categoryId) {
        // Create a quick category
        const category = await MessageService.createCategory({
          name: 'Campanha Rápida',
          user_id: user.id
        });
        categoryId = category.id;
      }
      
      // Create template
      await MessageService.createTemplate({
        category_id: categoryId,
        content: message,
        variables_used: []
      });
      
      toast.success('Campanha criada com sucesso!');
      setShowQuickCampaign(false);
      setSelectedEmpresas(new Set());
    } catch (error) {
      console.error('Error creating quick campaign:', error);
      toast.error('Erro ao criar campanha');
    }
  };

  const filterEmpresas = () => {
    setIsLoading(true);
    setTimeout(() => {
      let results = empresas.filter(empresa => {
        const searchTermMatch =
          empresa.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empresa.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empresa.cnpj_basico?.includes(searchTerm);

        const ufMatch = filters.uf ? empresa.uf === filters.uf : true;
        const municipioMatch = filters.municipio ? empresa.municipio === filters.municipio : true;
        const situacaoCadastralMatch = filters.situacao_cadastral ? empresa.situacao_cadastral === filters.situacao_cadastral : true;
        const cnaeFiscalMatch = filters.cnae_fiscal ? empresa.cnae_descricao?.includes(filters.cnae_fiscal) : true;
        const porteMatch = filters.porte ? empresa.porte?.toString() === filters.porte : true;

        return searchTermMatch && ufMatch && municipioMatch && situacaoCadastralMatch && cnaeFiscalMatch && porteMatch;
      });
      setFilteredEmpresas(results);
      setIsLoading(false);
    }, 200);
  };

  useEffect(() => {
    filterEmpresas();
  }, [searchTerm, filters, empresas]);

  const toggleEmpresaSelection = (empresaId: string) => {
    const newSelection = new Set(selectedEmpresas);
    if (selectedEmpresas.has(empresaId)) {
      newSelection.delete(empresaId);
    } else {
      newSelection.add(empresaId);
    }
    setSelectedEmpresas(newSelection);
  };
  
  const isEmpresaSelected = (empresaId: string) => {
    return selectedEmpresas.has(empresaId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospecção de Leads</h1>
          <p className="text-gray-600 mt-2">
            {filteredEmpresas.length} empresas encontradas
          </p>
        </div>
        <div className="flex gap-3">
          {selectedEmpresas.size > 0 && (
            <Button onClick={() => setShowQuickCampaign(true)}>
              <Send className="h-4 w-4 mr-2" />
              Campanha Rápida ({selectedEmpresas.size})
            </Button>
          )}
          <Button asChild>
            <Link to="/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          type="text"
          placeholder="Pesquisar por nome, CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select onValueChange={(value) => setFilters({ ...filters, uf: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por UF" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Limpar UF</SelectItem>
            <SelectItem value="AC">Acre</SelectItem>
            <SelectItem value="AL">Alagoas</SelectItem>
            <SelectItem value="AP">Amapá</SelectItem>
            <SelectItem value="AM">Amazonas</SelectItem>
            <SelectItem value="BA">Bahia</SelectItem>
            <SelectItem value="CE">Ceará</SelectItem>
            <SelectItem value="DF">Distrito Federal</SelectItem>
            <SelectItem value="ES">Espírito Santo</SelectItem>
            <SelectItem value="GO">Goiás</SelectItem>
            <SelectItem value="MA">Maranhão</SelectItem>
            <SelectItem value="MT">Mato Grosso</SelectItem>
            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
            <SelectItem value="MG">Minas Gerais</SelectItem>
            <SelectItem value="PA">Pará</SelectItem>
            <SelectItem value="PB">Paraíba</SelectItem>
            <SelectItem value="PR">Paraná</SelectItem>
            <SelectItem value="PE">Pernambuco</SelectItem>
            <SelectItem value="PI">Piauí</SelectItem>
            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
            <SelectItem value="RO">Rondônia</SelectItem>
            <SelectItem value="RR">Roraima</SelectItem>
            <SelectItem value="SC">Santa Catarina</SelectItem>
            <SelectItem value="SP">São Paulo</SelectItem>
            <SelectItem value="SE">Sergipe</SelectItem>
            <SelectItem value="TO">Tocantins</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Filtrar por Município"
          value={filters.municipio}
          onChange={(e) => setFilters({ ...filters, municipio: e.target.value })}
        />

        <Input
          type="text"
          placeholder="Filtrar por CNAE"
          value={filters.cnae_fiscal}
          onChange={(e) => setFilters({ ...filters, cnae_fiscal: e.target.value })}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultados da Prospecção</CardTitle>
          <CardDescription>
            Selecione as empresas que você deseja adicionar à campanha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>UF</TableHead>
                <TableHead>CNAE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredEmpresas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={isEmpresaSelected(empresa.id || '')}
                        onCheckedChange={() => toggleEmpresaSelection(empresa.id || '')}
                      />
                    </TableCell>
                    <TableCell>{empresa.nome_fantasia || empresa.razao_social}</TableCell>
                    <TableCell>{empresa.cnpj_basico}</TableCell>
                    <TableCell>{empresa.municipio}</TableCell>
                    <TableCell>{empresa.uf}</TableCell>
                    <TableCell>{empresa.cnae_descricao}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Quick Campaign Dialog */}
      <Dialog open={showQuickCampaign} onOpenChange={setShowQuickCampaign}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campanha Rápida</DialogTitle>
            <DialogDescription>
              Envie uma mensagem para {selectedEmpresas.size} empresas selecionadas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Categoria (opcional)</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                      {category.segment && (
                        <span className="text-gray-500 ml-2">({category.segment})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickCampaign(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickCampaign} disabled={!message.trim()}>
              Enviar Campanha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prospection;
