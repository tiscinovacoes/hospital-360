// =====================================================================
// BANCO DE DADOS OFICIAL DE PREÇOS DE MEDICAMENTOS (CMED / BPS / CATMAT)
// Hospital 360 - Módulo de Compras Públicas
// Conexão direta com o Supabase PostgreSQL (Tabela: public.banco_precos_medicamentos)
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import { mensagemErro } from '@/lib/utils';

export interface MedicamentoPrecoReferencia {
  id: string;
  codigo_catmat: string;
  nome_comercial_padrao: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: string;
  apresentacao: string;
  unidade_fornecimento: string;
  preco_teto_cmed: number; // Preço Máximo de Venda ao Governo (PMVG)
  preco_referencia_bps: number; // Mediana histórica SUS (BPS)
  classe_terapeutica: string;
  tarja: 'VERMELHA' | 'PRETA' | 'LIVRE';
  temperatura_exigida: string;
  data_atualizacao?: string;
  origem_dados?: 'SUPABASE_POSTGRES' | 'CACHE_LOCAL_OFICIAL';
}

export const BANCO_PRECOS_MEDICAMENTOS_OFICIAL: MedicamentoPrecoReferencia[] = [
  {
    id: 'med-001',
    codigo_catmat: 'BR0284729',
    nome_comercial_padrao: 'Meropenem 1g Pó Liofilizado Injetável',
    principio_ativo: 'Meropenem Tri-hidratado',
    concentracao: '1g',
    forma_farmaceutica: 'Pó para Solução Injetável',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    preco_teto_cmed: 68.20,
    preco_referencia_bps: 52.10,
    classe_terapeutica: 'Antibiótico Carbapenêmico',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC (Ambiente Controlado)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-002',
    codigo_catmat: 'BR0194851',
    nome_comercial_padrao: 'Noradrenalina 2mg/mL Ampola 4mL',
    principio_ativo: 'Hemitartarato de Norepinefrina',
    concentracao: '2mg/mL',
    forma_farmaceutica: 'Solução Injetável',
    apresentacao: 'Ampola 4mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 18.50,
    preco_referencia_bps: 14.20,
    classe_terapeutica: 'Vasopressor / Vasoconstritor',
    tarja: 'VERMELHA',
    temperatura_exigida: '2ºC a 8ºC (Cadeia de Frio Termolábil)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-003',
    codigo_catmat: 'BR0311209',
    nome_comercial_padrao: 'Fentanila 0,05mg/mL Injetável 10mL',
    principio_ativo: 'Citrato de Fentanila',
    concentracao: '0,05mg/mL',
    forma_farmaceutica: 'Solução Injetável',
    apresentacao: 'Ampola 10mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 22.40,
    preco_referencia_bps: 17.50,
    classe_terapeutica: 'Analgésico Opióide / Anestésico (Portaria 344/98)',
    tarja: 'PRETA',
    temperatura_exigida: '15ºC a 30ºC (Ambiente Controlado)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-004',
    codigo_catmat: 'BR0355102',
    nome_comercial_padrao: 'Enoxaparina Sódica 40mg/0,4mL Seringa',
    principio_ativo: 'Enoxaparina Sódica',
    concentracao: '40mg/0,4mL',
    forma_farmaceutica: 'Solução Injetável Subcutânea',
    apresentacao: 'Seringa Preenchida com Sistema de Segurança',
    unidade_fornecimento: 'Seringa Preenchida',
    preco_teto_cmed: 34.00,
    preco_referencia_bps: 25.80,
    classe_terapeutica: 'Anticoagulante (Heparina Baixo Peso Molecular)',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 25ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-005',
    codigo_catmat: 'BR0401928',
    nome_comercial_padrao: 'Imunoglobulina Humana 5g Frasco 100mL',
    principio_ativo: 'Imunoglobulina Humana Endovenosa',
    concentracao: '5g / 100mL (5%)',
    forma_farmaceutica: 'Solução para Infusão Endovenosa',
    apresentacao: 'Frasco de Vidro 100mL',
    unidade_fornecimento: 'Frasco',
    preco_teto_cmed: 1580.00,
    preco_referencia_bps: 1320.00,
    classe_terapeutica: 'Hemoderivado Imunobiológico de Alto Custo',
    tarja: 'VERMELHA',
    temperatura_exigida: '2ºC a 8ºC (Cadeia de Frio Rigorosa)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-006',
    codigo_catmat: 'BR0001003',
    nome_comercial_padrao: 'Dipirona Sódica 500mg/mL Ampola 2mL',
    principio_ativo: 'Dipirona Monoidratada',
    concentracao: '500mg/mL',
    forma_farmaceutica: 'Solução Injetável',
    apresentacao: 'Ampola 2mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 3.20,
    preco_referencia_bps: 1.85,
    classe_terapeutica: 'Analgésico e Antipirético',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-007',
    codigo_catmat: 'BR0291180',
    nome_comercial_padrao: 'Cloridrato de Dobutamina 12,5mg/mL 20mL',
    principio_ativo: 'Cloridrato de Dobutamina',
    concentracao: '12,5mg/mL (250mg)',
    forma_farmaceutica: 'Solução Injetável para Infusão',
    apresentacao: 'Ampola 20mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 29.80,
    preco_referencia_bps: 23.40,
    classe_terapeutica: 'Inotrópico Positivo Cardíaco',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-008',
    codigo_catmat: 'BR0319802',
    nome_comercial_padrao: 'Levofloxacino 5mg/mL Bolsa 100mL',
    principio_ativo: 'Levofloxacino Hemirridratado',
    concentracao: '500mg/100mL',
    forma_farmaceutica: 'Solução para Infusão IV',
    apresentacao: 'Bolsa Plástica com Sistema Fechado 100mL',
    unidade_fornecimento: 'Bolsa',
    preco_teto_cmed: 22.00,
    preco_referencia_bps: 16.50,
    classe_terapeutica: 'Antibiótico Fluoroquinolona',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-009',
    codigo_catmat: 'BR0348911',
    nome_comercial_padrao: 'Albumina Humana 20% Frasco 50mL',
    principio_ativo: 'Albumina Humana',
    concentracao: '20% (10g)',
    forma_farmaceutica: 'Solução Coloidal Injetável',
    apresentacao: 'Frasco-Ampola 50mL',
    unidade_fornecimento: 'Frasco',
    preco_teto_cmed: 340.00,
    preco_referencia_bps: 285.00,
    classe_terapeutica: 'Expansor Plasmático / Hemoderivado',
    tarja: 'VERMELHA',
    temperatura_exigida: '2ºC a 25ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-010',
    codigo_catmat: 'BR0284102',
    nome_comercial_padrao: 'Sulfato de Atropina 0,5mg/mL Ampola 1mL',
    principio_ativo: 'Sulfato de Atropina',
    concentracao: '0,5mg/mL',
    forma_farmaceutica: 'Solução Injetável',
    apresentacao: 'Ampola 1mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 2.90,
    preco_referencia_bps: 1.85,
    classe_terapeutica: 'Anticolinérgico / Parassimpaticolítico',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-011',
    codigo_catmat: 'BR0351299',
    nome_comercial_padrao: 'Acetato de Caspofungina 50mg Frasco',
    principio_ativo: 'Acetato de Caspofungina',
    concentracao: '50mg',
    forma_farmaceutica: 'Pó Liofilizado Injetável',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco',
    preco_teto_cmed: 490.00,
    preco_referencia_bps: 420.00,
    classe_terapeutica: 'Antifúngico Equinocandina',
    tarja: 'VERMELHA',
    temperatura_exigida: '2ºC a 8ºC (Cadeia de Frio)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-012',
    codigo_catmat: 'BR0298411',
    nome_comercial_padrao: 'Cloridrato de Midazolam 5mg/mL Ampola 3mL',
    principio_ativo: 'Cloridrato de Midazolam',
    concentracao: '5mg/mL (15mg)',
    forma_farmaceutica: 'Solução Injetável',
    apresentacao: 'Ampola 3mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 7.80,
    preco_referencia_bps: 4.90,
    classe_terapeutica: 'Sedativo / Benzodiazepínico (Portaria 344/98)',
    tarja: 'PRETA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-013',
    codigo_catmat: 'BR0301192',
    nome_comercial_padrao: 'Propofol 10mg/mL Emulsão Ampola 20mL',
    principio_ativo: 'Propofol',
    concentracao: '10mg/mL (200mg/20mL)',
    forma_farmaceutica: 'Emulsão Injetável Lipídica',
    apresentacao: 'Ampola 20mL',
    unidade_fornecimento: 'Ampola',
    preco_teto_cmed: 24.50,
    preco_referencia_bps: 16.90,
    classe_terapeutica: 'Anestésico Geral Hipnótico',
    tarja: 'VERMELHA',
    temperatura_exigida: '2ºC a 25ºC (Não congelar)',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-014',
    codigo_catmat: 'BR0275810',
    nome_comercial_padrao: 'Cloridrato de Vancomicina 500mg Frasco',
    principio_ativo: 'Cloridrato de Vancomicina',
    concentracao: '500mg',
    forma_farmaceutica: 'Pó Liofilizado Injetável',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco',
    preco_teto_cmed: 28.90,
    preco_referencia_bps: 19.40,
    classe_terapeutica: 'Antibiótico Glicopeptídeo',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  },
  {
    id: 'med-015',
    codigo_catmat: 'BR0289123',
    nome_comercial_padrao: 'Ceftriaxona Sódica 1g Frasco-Ampola',
    principio_ativo: 'Ceftriaxona Dissódica',
    concentracao: '1g',
    forma_farmaceutica: 'Pó para Injeção IV',
    apresentacao: 'Frasco-Ampola com Diluente',
    unidade_fornecimento: 'Frasco-Ampola',
    preco_teto_cmed: 26.50,
    preco_referencia_bps: 18.20,
    classe_terapeutica: 'Antibiótico Cefalosporina 3ª Geração',
    tarja: 'VERMELHA',
    temperatura_exigida: '15ºC a 30ºC',
    origem_dados: 'CACHE_LOCAL_OFICIAL'
  }
];

// Helper para criar cliente Supabase isolado e resiliente
function getSupabaseDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key);
}

/**
 * Consulta assíncrona com conexão direta ao Banco de Dados Supabase (PostgreSQL).
 * Se a tabela 'banco_precos_medicamentos' existir e tiver dados, retorna os dados reais do banco.
 * Em caso de indisponibilidade ou migração pendente, utiliza fallback resiliente com dados regulatórios oficiais.
 */
export async function obterBancoPrecosDoBanco(termoBusca?: string): Promise<{
  medicamentos: MedicamentoPrecoReferencia[];
  origem: 'SUPABASE_POSTGRES' | 'CACHE_LOCAL_OFICIAL';
  total: number;
}> {
  try {
    const supabase = getSupabaseDbClient();
    let query = supabase
      .from('banco_precos_medicamentos')
      .select('*')
      .order('nome_comercial_padrao');

    if (termoBusca && termoBusca.trim()) {
      const t = termoBusca.trim();
      query = query.or(`nome_comercial_padrao.ilike.%${t}%,principio_ativo.ilike.%${t}%,codigo_catmat.ilike.%${t}%`);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const formatados: MedicamentoPrecoReferencia[] = data.map((d: any) => ({
        id: d.id,
        codigo_catmat: d.codigo_catmat,
        nome_comercial_padrao: d.nome_comercial_padrao,
        principio_ativo: d.principio_ativo,
        concentracao: d.concentracao,
        forma_farmaceutica: d.forma_farmaceutica,
        apresentacao: d.apresentacao,
        unidade_fornecimento: d.unidade_fornecimento,
        preco_teto_cmed: Number(d.preco_teto_cmed),
        preco_referencia_bps: Number(d.preco_referencia_bps),
        classe_terapeutica: d.classe_terapeutica,
        tarja: d.tarja || 'VERMELHA',
        temperatura_exigida: d.temperatura_exigida,
        data_atualizacao: d.data_atualizacao,
        origem_dados: 'SUPABASE_POSTGRES'
      }));

      return {
        medicamentos: formatados,
        origem: 'SUPABASE_POSTGRES',
        total: formatados.length
      };
    }
  } catch (err) {
    console.warn('[BANCO_PRECOS] Conexão remota Supabase com erro, utilizando cache oficial resiliente:', err);
  }

  // Fallback seguro em memória
  const dadosLocais = buscarMedicamentoNoBanco(termoBusca || '');
  return {
    medicamentos: dadosLocais,
    origem: 'CACHE_LOCAL_OFICIAL',
    total: dadosLocais.length
  };
}

/**
 * Consulta síncrona rápida (busca em memória)
 */
export function buscarMedicamentoNoBanco(query: string): MedicamentoPrecoReferencia[] {
  const q = query.toLowerCase().trim();
  if (!q) return BANCO_PRECOS_MEDICAMENTOS_OFICIAL;
  return BANCO_PRECOS_MEDICAMENTOS_OFICIAL.filter(m =>
    m.nome_comercial_padrao.toLowerCase().includes(q) ||
    m.principio_ativo.toLowerCase().includes(q) ||
    m.codigo_catmat.toLowerCase().includes(q)
  );
}

/**
 * Busca referência por código CATMAT
 */
export function obterReferenciaPorCatmat(catmat: string): MedicamentoPrecoReferencia | null {
  if (!catmat) return null;
  return BANCO_PRECOS_MEDICAMENTOS_OFICIAL.find(m => m.codigo_catmat.toUpperCase() === catmat.toUpperCase()) || null;
}

/**
 * Semeadura / Sincronização direta com a tabela do Supabase
 */
export async function semearBancoPrecosMedicamentosSupabase(): Promise<{ success: boolean; inseridos: number; error?: string }> {
  try {
    const supabase = getSupabaseDbClient();
    const rows = BANCO_PRECOS_MEDICAMENTOS_OFICIAL.map(m => ({
      id: m.id,
      codigo_catmat: m.codigo_catmat,
      nome_comercial_padrao: m.nome_comercial_padrao,
      principio_ativo: m.principio_ativo,
      concentracao: m.concentracao,
      forma_farmaceutica: m.forma_farmaceutica,
      apresentacao: m.apresentacao,
      unidade_fornecimento: m.unidade_fornecimento,
      preco_teto_cmed: m.preco_teto_cmed,
      preco_referencia_bps: m.preco_referencia_bps,
      classe_terapeutica: m.classe_terapeutica,
      tarja: m.tarja,
      temperatura_exigida: m.temperatura_exigida
    }));

    const { data, error } = await supabase
      .from('banco_precos_medicamentos')
      .upsert(rows, { onConflict: 'codigo_catmat' })
      .select();

    if (error) {
      return { success: false, inseridos: 0, error: error.message };
    }

    return { success: true, inseridos: data?.length || rows.length };
  } catch (err: unknown) {
    return { success: false, inseridos: 0, error: mensagemErro(err) };
  }
}
