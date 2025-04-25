export interface Company {
  cnpj: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnae_fiscal: string | null;
  cnae_descricao: string | null;
  municipio: string | null;
  uf: string | null;
  data_inicio_atividade: string | null;
  logradouro: string | null;
  tipo_logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  telefone_1: string | null;
  telefone_2: string | null;
  email: string | null;
  situacao_cadastral: string | null;
}

// Interface para parâmetros de busca
export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  uf?: string;
  cidade?: string;
  cnae?: string;
  porte?: string;
  cursor?: string;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}

interface CompaniesResponse {
  companies: Company[];
  total: number;
  totalPages: number;
  currentPage: number;
  has_more?: boolean;
  execution_time?: number;
  mockData?: boolean;
  fromCache?: boolean;
}

class DatabaseService {
  private static instance: DatabaseService;
  private baseUrl = 'http://localhost:3001';
  private defaultTimeout = 60000; // 60 segundos

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async getCompanies(params: SearchParams = {}): Promise<CompaniesResponse> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      
      // Construir URL com parâmetros
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Adicionar filtros se existirem
      if (params.search) queryParams.append('search', params.search);
      if (params.uf) queryParams.append('uf', params.uf);
      if (params.cidade) queryParams.append('municipio', params.cidade);
      if (params.cnae) queryParams.append('cnae', params.cnae);
      if (params.order_by) queryParams.append('order_by', params.order_by);
      if (params.order_dir) queryParams.append('order_dir', params.order_dir);
      
      const url = `${this.baseUrl}/read/empresas_AC.parquet?${queryParams.toString()}`;
      console.log(`Fazendo requisição para: ${url}`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.defaultTimeout)
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
      return data;

    } catch (error) {
      console.error(`Failed to get companies:`, error);
      throw error;
    }
  }
}

export const databaseService = DatabaseService.getInstance(); 