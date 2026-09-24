// ============================================================================
// Tipos Canônicos do Domínio: Estoque Central (CAF) + Farmácias UBS (Itaquiraí-MS)
// ============================================================================

export type TipoLocal = 'CAF' | 'FARMACIA_UBS';

export type StatusLote = 'LIBERADO' | 'QUARENTENA' | 'BLOQUEADO_RECALL' | 'VENCIDO';

export type TipoMovimentacao = 
  | 'ENTRADA_NF'
  | 'TRANSFERENCIA_SAIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'DISPENSACAO'
  | 'AJUSTE_INVENTARIO'
  | 'PERDA'
  | 'VENCIMENTO'
  | 'RECALL'
  | 'DEVOLUCAO';

export type StatusSolicitacao = 
  | 'RASCUNHO'
  | 'ENVIADA'
  | 'EM_SEPARACAO'
  | 'LIBERADA'
  | 'RECEBIDA'
  | 'RECEBIDA_COM_DIVERGENCIA'
  | 'CANCELADA';

export type PerfilEstoque = 
  | 'ESTOQUISTA_CAF'
  | 'CONFERENTE'
  | 'FARMACEUTICO_UBS'
  | 'GESTOR_MUNICIPAL';

export interface CatmatItem {
  codigo_catmat: string;
  descricao: string;
  unidade_fornecimento?: string;
  classe_pdm: string;
  codigo_pdm?: number;
  nome_pdm?: string;
  ativo: boolean;
  sustentavel: boolean;
  codigo_ncm?: string;
  atualizado_em?: string;
}

export interface ProdutoFarmacia {
  id: string;
  tenant_id: string;
  codigo_catmat: string;
  nome: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: string;
  unidade_base: string; // Ex: 'COMPRIMIDO', 'AMPOLA', 'CAPSULA', 'FRASCO', 'ML'
  controlado: boolean;  // Portaria 344
  termolabil: boolean;  // Cadeia de frio 2ºC a 8ºC
  estoque_minimo_padrao: number;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
  embalagens?: ProdutoEmbalagem[];
}

export interface ProdutoEmbalagem {
  id: string;
  tenant_id: string;
  produto_id: string;
  tipo_embalagem: string; // Ex: 'CAIXA', 'CARTELA', 'BLISTER', 'FRASCO', 'COMPRIMIDO'
  fator_conversao_base: number; // Ex: Caixa = 100 comprimidos
  codigo_barras?: string;
  padrao_entrada?: boolean;
}

export interface LocalEstoque {
  id: string;
  tenant_id: string;
  tipo: TipoLocal;
  nome: string;
  cnes: string;
  endereco: string;
  ativo: boolean;
}

export interface LoteEstoque {
  id: string;
  tenant_id: string;
  produto_id: string;
  produto_nome?: string;
  codigo_catmat?: string;
  numero_lote: string;
  fabricante: string;
  data_fabricacao?: string;
  data_validade: string;
  nfe_origem?: string;
  custo_unitario_base: number;
  status: StatusLote;
  motivo_bloqueio?: string;
  termolabil?: boolean;
  controlado?: boolean;
  dias_ate_vencimento?: number;
  saldo_total?: number;
  criado_em?: string;
}

export interface SaldoLoteLocal {
  id: string;
  tenant_id: string;
  lote_id: string;
  local_id: string;
  quantidade: number; // Sempre inteiro na unidade base
  atualizado_em?: string;
  lote?: LoteEstoque;
  local?: LocalEstoque;
}

export interface MovimentacaoEstoque {
  id: string;
  tenant_id: string;
  tipo: TipoMovimentacao;
  lote_id: string;
  numero_lote?: string;
  produto_nome?: string;
  local_origem_id?: string;
  local_origem_nome?: string;
  local_destino_id?: string;
  local_destino_nome?: string;
  quantidade: number; // Inteiro na unidade base
  usuario_id: string;
  documento_referencia?: string;
  justificativa?: string;
  criado_em: string;
}

export interface SolicitacaoItem {
  id: string;
  solicitacao_id: string;
  produto_id: string;
  produto_nome?: string;
  codigo_catmat?: string;
  unidade_base?: string;
  quantidade_solicitada: number;
  quantidade_aprovada: number;
  quantidade_separada: number;
  quantidade_recebida: number;
  separacoes?: SeparacaoItem[];
}

export interface SeparacaoItem {
  id: string;
  solicitacao_item_id: string;
  lote_id: string;
  numero_lote?: string;
  data_validade?: string;
  lote_sugerido_id?: string;
  numero_lote_sugerido?: string;
  quantidade: number;
  fora_fefo: boolean;
  justificativa?: string;
  separado_por: string;
}

export interface SolicitacaoEstoque {
  id: string;
  tenant_id: string;
  numero_solicitacao: string;
  local_origem_id: string; // CAF
  local_origem_nome?: string;
  local_solicitante_id: string; // UBS
  local_solicitante_nome?: string;
  status: StatusSolicitacao;
  solicitado_por: string;
  observacoes?: string;
  divergencia_motivo?: string;
  criado_em: string;
  atualizado_em?: string;
  itens: SolicitacaoItem[];
}

export interface ItemNfeRastro {
  nLote: string;
  qLote: number;
  dFab?: string;
  dVal: string;
}

export interface ItemNfeParsed {
  nItem: number;
  cProd: string;
  xProd: string;
  NCM?: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  rastro: ItemNfeRastro[];
  produto_id_vinculado?: string;
  fator_conversao?: number;
  quantidade_unidade_base?: number;
}

export interface NfeXmlParsed {
  chaveAcesso: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  emitenteCnpj: string;
  emitenteNome: string;
  destinatarioCnpj: string;
  destinatarioNome: string;
  valorTotal: number;
  itens: ItemNfeParsed[];
}

export interface ConferenciaCegaItem {
  nItem: number;
  cProd: string;
  xProd: string;
  produto_id: string;
  lote_contado: string;
  validade_contada: string;
  quantidade_contada_embalagem: number;
  tipo_embalagem: string;
  quantidade_contada_base: number;
  quantidade_nfe_base: number;
  divergencia_detectada: boolean;
  motivo_divergencia?: string;
}
