'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Boxes,
  UserCheck,
  Stethoscope,
  FlaskConical,
  BedDouble,
  CreditCard,
  MessageSquare,
  FileSpreadsheet,
  ShieldCheck,
  Pill,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Bell,
  Info,
  Trash2,
  Home,
  Inbox,
} from 'lucide-react';
import {
  Button,
  Badge,
  ModuleCard,
  KpiCard,
  type ModuleCategoria,
  Input,
  FormField,
  Dialog,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tooltip,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

/**
 * PROTÓTIPO LOCAL — Design System v2.1 (cores de categoria refinadas)
 * v2.1 adotada como paleta oficial em todo o projeto — ver IDENTIDADE_VISUAL
 * (1).md § 2.1. ModuleCard, ModuloLayoutShell (CATEGORIA_THEME) e os 13
 * módulos reais já usam os mesmos tons mostrados aqui.
 *
 * Esta versão consome a biblioteca formal em src/components/ui/
 * (Button, Badge, ModuleCard, Input/FormField, Dialog, Alert, Table,
 * Tooltip, Tabs) em vez de reimplementar cada padrão inline.
 */

type Categoria = ModuleCategoria;

const CATEGORIA_INFO: Record<Categoria, { label: string; old: string; soft: string; softBg: string; softBorder: string }> = {
  SUPRIMENTOS: { label: 'Suprimentos & Atas', old: '#0E5C4C', soft: '#4E9B8A', softBg: 'rgba(78,155,138,0.12)', softBorder: 'rgba(78,155,138,0.35)' },
  ASSISTENCIAL: { label: 'Clínico & Assistencial', old: '#C1622D', soft: '#5B84B1', softBg: 'rgba(91,132,177,0.12)', softBorder: 'rgba(91,132,177,0.35)' },
  OPERACAO: { label: 'Pessoas & Operação', old: '#8A6A16', soft: '#C99A4A', softBg: 'rgba(201,154,74,0.14)', softBorder: 'rgba(201,154,74,0.35)' },
  FINANCEIRO: { label: 'Financeiro & Governança', old: '#1B1F1C', soft: '#7C93A3', softBg: 'rgba(124,147,163,0.12)', softBorder: 'rgba(124,147,163,0.35)' },
};

const TONS_SAUDE_EXTRA = [
  { nome: 'Cyan Clínico', hex: '#4FA3AE' },
  { nome: 'Verde-Menta', hex: '#5FA88C' },
  { nome: 'Azul Sereno', hex: '#6E92C9' },
  { nome: 'Lavanda Suave', hex: '#8B87BE' },
];

interface ModuloItem {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
  categoria: Categoria;
  tag: string;
  metricas?: string;
}

const MODULOS: ModuloItem[] = [
  { id: 'compras-atas', titulo: 'Compras Públicas & Gestão de Atas (ARP)', subtitulo: 'Em Conformidade Estrita com a Lei 14.133/21', descricao: 'Gestão de Atas de Registro de Preços, limite legal carona (50%), empenho digital e trava preventiva contra sobrepreço.', icone: ShoppingCart, categoria: 'SUPRIMENTOS', tag: 'LEI 14.133/21', metricas: 'Trava CMED & BPS Ativa' },
  { id: 'estoque-central', titulo: 'Estoque Central & Centro de Distribuição', subtitulo: 'Vigia Saúde • Armazenagem & Climatização RDC 430', descricao: 'Monitoramento contínuo de temperatura e umidade, ordenação FEFO e laudo de quarentena sanitária.', icone: Boxes, categoria: 'SUPRIMENTOS', tag: 'FEFO • RDC 430', metricas: '4 Locais Monitorados' },
  { id: 'farmacia-satelite', titulo: 'Farmácia Satélite & Dispensação Beira-Leito', subtitulo: 'OpenBoxes Integration com Baixa Atômica', descricao: 'Dispensação segura por leitura de código de barras, conferência de dose unitária e baixa automática por lote FEFO.', icone: Pill, categoria: 'SUPRIMENTOS', tag: 'BEIRA-LEITO', metricas: 'Alerta de Lotes Vencendo' },
  { id: 'gestao-clinica', titulo: 'Consultório & Clínica Médica (OpenEMR)', subtitulo: 'Prontuário Eletrônico do Paciente (PEP)', descricao: 'Atendimento ambulatorial, anamnese, prescrição eletrônica estruturada e jornada clínica integrada.', icone: Stethoscope, categoria: 'ASSISTENCIAL', tag: 'PEP AMBULATORIAL', metricas: 'Fila e Prontuário Rápido' },
  { id: 'laboratorio-lims', titulo: 'Laboratório & Análises Clínicas (LIMS)', subtitulo: 'Conector Senaite & Equipamentos Automatizados', descricao: 'Gestão de amostras, interfaceamento com analisadores e laudos com assinatura digital.', icone: FlaskConical, categoria: 'ASSISTENCIAL', tag: 'LIMS SENAITE', metricas: 'Tempo Porta-Resultado' },
  { id: 'leitos-censo', titulo: 'Censo Hospitalar & Gestão de Leitos', subtitulo: 'Mapa de Ocupação em Tempo Real (UTI e Enfermarias)', descricao: 'Controle de internação, alta, transferência, higienização e tempo médio de permanência.', icone: BedDouble, categoria: 'ASSISTENCIAL', tag: 'CENSO DE LEITOS', metricas: 'Taxa de Ocupação Ativa' },
  { id: 'regulacao-vagas', titulo: 'Regulação de Vagas & TFD', subtitulo: 'Complexo Regulador SUS', descricao: 'Protocolo de Manchester, ambulâncias e transferências inter-hospitalares.', icone: BedDouble, categoria: 'ASSISTENCIAL', tag: 'COMPLEXO REGULADOR', metricas: 'Fila de Regulação' },
  { id: 'escala-medica', titulo: 'Escala Médica, Ponto GPS & PIX D+0', subtitulo: 'Ponto Eletrônico por Geofencing (<100m) e Biometria', descricao: 'Validação de presença em raio de 100m, cofre de certificados CRM/ATLS/PALS e antecipação instantânea PIX.', icone: UserCheck, categoria: 'OPERACAO', tag: 'GEOFENCE <100M', metricas: '100% Cobertura de Postos' },
  { id: 'automacao-n8n', titulo: 'Central n8n & Mensageria WhatsApp Poli', subtitulo: 'Barramento de Interoperabilidade e IA Conversacional', descricao: 'Lembretes de consultas no WhatsApp, triagem automatizada com IA e integração via webhooks.', icone: MessageSquare, categoria: 'OPERACAO', tag: 'N8N & WHATSAPP', metricas: 'Atendimento Omnichannel' },
  { id: 'ingestao-dados', titulo: 'Hub de Ingestão de Dados & Conectores CSV', subtitulo: 'Importador Universal para Sistemas Legados', descricao: 'Importação de prontuários, estoques legados e escalas via CSV ou integração REST direta.', icone: FileSpreadsheet, categoria: 'OPERACAO', tag: 'IMPORTADOR CSV', metricas: 'Validação de Schemas' },
  { id: 'fintech-split', titulo: 'Fintech Split de Pagamentos & NFS-e', subtitulo: 'Hyperswitch Engine & Serviço Fiscal .NET C#', descricao: 'Divisão imediata de receitas entre condomínio e médicos parceiros, com emissão automática de NFS-e.', icone: CreditCard, categoria: 'FINANCEIRO', tag: 'SPLIT DE REPASSE', metricas: 'Roteamento Multi-Adquirente' },
  { id: 'blindagem-seguranca', titulo: 'Blindagem RN-IND & Auditoria CRED-OMEGA', subtitulo: 'Conformidade LGPD, RLS e Rotação de Segredos', descricao: 'Painel de segurança com trilha de auditoria completa e isolamento de inquilinos (tenants).', icone: ShieldCheck, categoria: 'FINANCEIRO', tag: 'SEGURANÇA & RLS', metricas: 'Segurança Militar' },
];

/** Card padrão de seção do guia — moldura das vitrines de componentes abaixo. */
function GuiaCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle mb-3.5">{titulo}</p>
      {children}
    </div>
  );
}

export default function PrototipoIdentidadePage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('TODAS');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [toastVisivel, setToastVisivel] = useState(false);
  const [tabAtiva, setTabAtiva] = useState('geral');

  function dispararToast() {
    setToastVisivel(true);
    window.setTimeout(() => setToastVisivel(false), 3000);
  }

  const modulosFiltrados = MODULOS.filter(m => categoriaAtiva === 'TODAS' || m.categoria === categoriaAtiva);

  return (
    <div className="min-h-screen bg-surface font-sans">
      <div className="bg-foreground text-surface text-center text-xs font-semibold py-2 px-4">
        🎨 Protótipo local — Design System v2.1 · agora consumindo @/components/ui · não afeta produção
      </div>

      {/* ══════════════ CABEÇALHO PADRÃO ══════════════ */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl border border-border bg-surface-subtle flex items-center justify-center"
            onClick={() => setSidebarAberta(!sidebarAberta)}
            aria-label={sidebarAberta ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarAberta ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/40 uppercase tracking-wider hidden sm:inline">Vigia Saúde 360</span>
              <span className="text-foreground/20 hidden sm:inline">/</span>
              <h1 className="text-xs sm:text-base font-semibold text-foreground">Design System v2.1</h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[rgba(91,132,177,.35)] bg-[rgba(91,132,177,.12)] text-[#5B84B1] hidden md:inline-flex">
                PROTÓTIPO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-foreground-subtle hidden md:block">Biblioteca de componentes em @/components/ui</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-5 w-px bg-border hidden sm:block" />
          <Tooltip label="Notificações">
            <button className="w-10 h-10 rounded-xl bg-white hover:bg-surface border border-border text-foreground-muted flex items-center justify-center transition-colors relative" aria-label="Notificações">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-critical ring-2 ring-white" aria-hidden="true" />
            </button>
          </Tooltip>
          <div className="w-9 h-9 rounded-xl bg-foreground text-surface font-black text-xs flex items-center justify-center" aria-hidden="true">JS</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">

        {/* ── PALETA: ANTES / DEPOIS ────────────────────────── */}
        <section>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-foreground mb-1 text-pretty">
            Paleta de Categoria — Antes / Depois
          </h1>
          <p className="text-sm text-foreground-muted mb-6 max-w-2xl">
            Mesma família de cor, mais clara e menos saturada — sempre sólida, sem degradê. Cores de ação (botão
            primário) e de status (sucesso/atenção/crítico) não mudam.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(CATEGORIA_INFO) as Categoria[]).map(cat => {
              const info = CATEGORIA_INFO[cat];
              return (
                <div key={cat} className="bg-white rounded-xl border border-border p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle mb-3">{info.label}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-10 rounded-lg mb-1" style={{ backgroundColor: info.old }} />
                      <span className="text-[10px] font-mono text-foreground-subtle">{info.old}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-10 rounded-lg mb-1" style={{ backgroundColor: info.soft }} />
                      <span className="text-[10px] font-mono text-foreground-subtle">{info.soft}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle mt-6 mb-3">
            Tons de referência extra — família azul/verde clínico
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TONS_SAUDE_EXTRA.map(tom => (
              <div key={tom.hex} className="bg-white rounded-xl border border-border p-3">
                <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: tom.hex }} />
                <p className="text-[11px] font-bold text-foreground">{tom.nome}</p>
                <p className="text-[10px] font-mono text-foreground-subtle">{tom.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ BOTÕES ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Botões</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Variantes — <Button variant=... />">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Perigo</Button>
              </div>
              <p className="text-[11px] text-foreground/50 mt-3">Regra dura: no máximo 1 botão primário (terracota) visível por tela.</p>
            </GuiaCard>

            <GuiaCard titulo="Tamanhos, ícone, estados">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary">
                  <FileSpreadsheet className="w-4 h-4" /> Com ícone
                </Button>
                <Button disabled>Desabilitado</Button>
                <Button loading>Carregando</Button>
              </div>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ KPIs — <KpiCard /> ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">KPIs</h2>
          <p className="text-[11px] text-foreground-subtle mb-4">Role até aqui: valores inteiros (ex: 12) contam de 0 até o valor ao entrar na tela.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { cat: 'SUPRIMENTOS' as Categoria, label: 'Atas Ativas', valor: '12', delta: '+2 este mês', trend: 'up' as const },
              { cat: 'ASSISTENCIAL' as Categoria, label: 'Leitos Ocupados', valor: '87%', delta: '+4% na semana', trend: 'up' as const },
              { cat: 'OPERACAO' as Categoria, label: 'Plantões em Aberto', valor: '3', delta: '-5 vs. mês anterior', trend: 'down' as const },
              { cat: 'FINANCEIRO' as Categoria, label: 'Split Processado', valor: 'R$ 812k', delta: '+12% no mês', trend: 'up' as const },
            ].map((kpi, i) => (
              <KpiCard
                key={i}
                label={kpi.label}
                valor={kpi.valor}
                delta={kpi.delta}
                trend={kpi.trend}
                accentColor={CATEGORIA_INFO[kpi.cat].soft}
              />
            ))}
          </div>
        </section>

        {/* ══════════════ MENUS ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Menus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Sidebar — item de navegação">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px] bg-foreground text-surface">
                  <span className="w-[6px] h-[6px] rounded-full bg-surface" aria-hidden="true" />
                  <Home className="w-4 h-4" /> Ativo
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px] text-foreground/75 hover:bg-white/90">
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: CATEGORIA_INFO.SUPRIMENTOS.soft }} aria-hidden="true" />
                  <ShoppingCart className="w-4 h-4 text-foreground/60" /> Padrão / hover
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold min-h-[44px] text-foreground/30">
                  <span className="w-[6px] h-[6px] rounded-full bg-foreground/20" aria-hidden="true" />
                  <Boxes className="w-4 h-4 text-foreground/25" /> Desabilitado
                </div>
              </div>
            </GuiaCard>

            <GuiaCard titulo="Tabs — <Tabs><TabsList><TabsTrigger /></Tabs>">
              <Tabs value={tabAtiva} onChange={setTabAtiva}>
                <TabsList>
                  <TabsTrigger value="geral">Visão Geral</TabsTrigger>
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-[11px] text-foreground/50 mt-3">Aba ativa: <strong className="text-foreground">{tabAtiva}</strong></p>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ TOOLTIPS & POPUPS ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Tooltips & Popups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Tooltip — <Tooltip label=...>">
              <div className="flex items-center gap-4">
                <Tooltip label="Ajuda contextual">
                  <button className="w-9 h-9 rounded-full border border-border text-foreground/60 flex items-center justify-center" aria-label="Ajuda contextual">
                    <Info className="w-4 h-4" />
                  </button>
                </Tooltip>
                <Tooltip label="Excluir permanentemente">
                  <button className="w-9 h-9 rounded-full border border-border text-critical flex items-center justify-center" aria-label="Excluir permanentemente">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Tooltip>
                <span className="text-[11px] text-foreground/50">↑ hover ou Tab (teclado)</span>
              </div>
            </GuiaCard>

            <GuiaCard titulo="Popup / Modal — <Dialog />">
              <Button variant="primary" onClick={() => setModalAberto(true)}>
                Abrir modal de exemplo
              </Button>
            </GuiaCard>

            <GuiaCard titulo="Toast de notificação">
              <Button variant="secondary" onClick={dispararToast}>
                Disparar toast &quot;Salvo com sucesso&quot;
              </Button>
              <p className="text-[11px] text-foreground/50 mt-3 mb-3">Ao clicar, some sozinho em 3s no canto inferior direito. Modelo fixo dos 3 estados abaixo (mesmas cores semânticas do Alert):</p>
              <div className="space-y-2">
                <Alert variant="success">Salvo com sucesso.</Alert>
                <Alert variant="warning">Verifique os campos pendentes.</Alert>
                <Alert variant="critical">Falha ao salvar. Tente novamente.</Alert>
              </div>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ FORMULÁRIOS ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Formulários</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Campos de entrada — <FormField><Input /></FormField>">
              <div className="space-y-3">
                <FormField label="Padrão">
                  <Input type="text" placeholder="Digite aqui..." />
                </FormField>
                <FormField label="Erro" error="Código CATMAT não encontrado na base.">
                  <Input type="text" defaultValue="CATMAT inválido" />
                </FormField>
              </div>
            </GuiaCard>

            <GuiaCard titulo="Select, checkbox, toggle">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground/60 mb-1.5" htmlFor="proto-select">Select</label>
                  <select id="proto-select" className="w-full px-3 py-2.5 min-h-[40px] rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-action/20">
                    <option>Todos os centros de custo</option>
                    <option>UTI Adulto</option>
                    <option>Pronto-Socorro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-action" /> Notificar por e-mail (marcado)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <input type="checkbox" className="w-4 h-4 rounded accent-action" /> Notificar por SMS (desmarcado)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground/35">
                    <input type="checkbox" disabled className="w-4 h-4 rounded" /> Notificar por push (desabilitado)
                  </label>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-3 text-xs font-semibold text-foreground">
                    <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-action transition-colors flex-shrink-0">
                      <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
                    </span>
                    Ativo (ligado)
                  </label>
                  <label className="flex items-center gap-3 text-xs font-semibold text-foreground">
                    <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-foreground/15 transition-colors flex-shrink-0">
                      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform" />
                    </span>
                    Inativo (desligado)
                  </label>
                  <label className="flex items-center gap-3 text-xs font-semibold text-foreground/35">
                    <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-border-subtle transition-colors flex-shrink-0">
                      <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white/70 transition-transform" />
                    </span>
                    Desabilitado
                  </label>
                </div>
              </div>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ TABELA DE DADOS ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Tabela de Dados</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ata</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { ata: 'ARP-2026/042-SMS', item: 'Luva Cirúrgica Estéril nº 7,5', saldo: 'R$ 812.400,00', status: 'Ativo', variant: 'active' as const },
                { ata: 'ARP-2026/018-SMS', item: 'Seringa Descartável 10ml', saldo: 'R$ 94.200,00', status: 'Em análise', variant: 'warning' as const },
                { ata: 'ARP-2025/301-SMS', item: 'Álcool 70% 1L', saldo: 'R$ 0,00', status: 'Esgotado', variant: 'critical' as const },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell mono>{row.ata}</TableCell>
                  <TableCell>{row.item}</TableCell>
                  <TableCell currency>{row.saldo}</TableCell>
                  <TableCell>
                    <Badge variant={row.variant}>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-1 py-3 text-[11px] text-foreground-subtle">
            <span>Mostrando 1–3 de 47</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground/40" disabled aria-label="Página anterior">‹</button>
              <button className="w-8 h-8 rounded-lg bg-foreground text-surface text-xs font-bold flex items-center justify-center" aria-current="page">1</button>
              <button className="w-8 h-8 rounded-lg text-foreground/60 text-xs font-bold flex items-center justify-center hover:bg-white">2</button>
              <button className="w-8 h-8 rounded-lg text-foreground/60 text-xs font-bold flex items-center justify-center hover:bg-white">3</button>
              <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground/60" aria-label="Próxima página">›</button>
            </div>
          </div>
        </section>

        {/* ══════════════ ALERTAS & ESTADO VAZIO ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Alertas & Estado Vazio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Banners — <Alert variant=... />">
              <div className="space-y-2.5">
                <Alert variant="success">Trava CMED & BPS ativa — nenhuma divergência encontrada.</Alert>
                <Alert variant="warning">Ata ARP-2026/018 com saldo em 80% — renovação recomendada.</Alert>
                <Alert variant="critical">Item esgotado — bloqueado para novos empenhos.</Alert>
              </div>
            </GuiaCard>

            <GuiaCard titulo="Estado vazio">
              <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6 text-foreground/30" />
                </div>
                <p className="text-xs font-bold text-foreground">Nenhum resultado encontrado</p>
                <p className="text-[11px] text-foreground/50 mt-1 max-w-[220px]">Ajuste os filtros ou tente outro termo de busca.</p>
              </div>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ RODAPÉS ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4 text-pretty">Rodapés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuiaCard titulo="Rodapé de card (métrica + ação)">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-foreground/60 mb-3">Conteúdo do card...</p>
                <div className="pt-3.5 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold" style={{ color: CATEGORIA_INFO.SUPRIMENTOS.soft }}>Trava CMED & BPS Ativa</span>
                  <span className="inline-flex items-center gap-1 font-bold text-foreground">Acessar <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </GuiaCard>

            <GuiaCard titulo="Rodapé de página (padrão global)">
              <div className="rounded-lg border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-foreground-subtle">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-action" />
                  <span>Plataforma homologada — RLS ativo em todos os módulos.</span>
                </div>
                <span className="font-semibold">Vigia Saúde 360 · Release 2026.09</span>
              </div>
            </GuiaCard>
          </div>
        </section>

        {/* ══════════════ HUB DE MÓDULOS — <ModuleCard /> ══════════════ */}
        <section>
          <h2 className="font-display font-semibold text-xl text-foreground mb-1 text-pretty">
            Hub de Módulos — &lt;ModuleCard /&gt; da biblioteca
          </h2>
          <p className="text-sm text-foreground-muted mb-2">
            Redimensione a janela para ver o grid se reajustar (1 coluna no celular, 2 no tablet, 3 no desktop).
          </p>
          <p className="text-[11px] text-action font-semibold mb-6">
            ✓ Paleta v2.1 adotada — mesmos tons da seção &quot;Paleta&quot; acima, já aplicados nos 13 módulos reais.
          </p>

          <div className="flex items-center gap-5 overflow-x-auto pb-3 mb-5 border-b border-border">
            {[
              { id: 'TODAS', label: 'Todos os Módulos' },
              { id: 'SUPRIMENTOS', label: 'Suprimentos & Atas' },
              { id: 'ASSISTENCIAL', label: 'Clínico & Assistencial' },
              { id: 'OPERACAO', label: 'Pessoas & Operação' },
              { id: 'FINANCEIRO', label: 'Financeiro & Governança' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`pb-3 min-h-[44px] text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-px flex-shrink-0 ${
                  categoriaAtiva === cat.id ? 'border-action text-foreground' : 'border-transparent text-foreground-subtle'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulosFiltrados.map((modulo, i) => (
              <div
                key={`${categoriaAtiva}-${modulo.id}`}
                className="animate-card-enter"
                style={{ '--card-delay': `${Math.min(i, 8) * 50}ms` } as React.CSSProperties}
              >
                <ModuleCard
                  id={modulo.id}
                  titulo={modulo.titulo}
                  subtitulo={modulo.subtitulo}
                  descricao={modulo.descricao}
                  categoria={modulo.categoria}
                  metricas={modulo.metricas}
                  icone={modulo.icone}
                  href="#"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="pt-5 border-t border-border flex items-center gap-2 text-xs text-foreground-subtle">
          <CheckCircle2 className="w-4 h-4 text-action" />
          <span>Protótipo isolado — nenhuma tela real foi alterada. Aguardando validação para aplicar aos 13 módulos.</span>
        </div>
      </div>

      {/* ══════════════ MODAL DE EXEMPLO — <Dialog /> ══════════════ */}
      <Dialog
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Confirmar ação"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setModalAberto(false)}>Confirmar</Button>
          </>
        }
      >
        Este é o padrão de popup/modal do design system: overlay com blur, fecha ao clicar fora, no X ou na tecla
        Esc, raio 16px (teto máximo), botão primário único. Foco travado dentro do modal (Tab/Shift+Tab).
      </Dialog>

      {/* ══════════════ TOAST ══════════════ */}
      {toastVisivel && (
        <div className="fixed bottom-5 right-5 z-[70] animate-[fadeIn_.15s_ease-out]" role="status">
          <Alert variant="success" className="shadow-lg bg-white w-fit">Salvo com sucesso.</Alert>
        </div>
      )}
    </div>
  );
}
