'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG } from '@/types/rbac';
import {
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Fingerprint,
  ArrowLeftRight,
  Zap,
  FileBadge,
  DollarSign,
  Download,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  UploadCloud,
  FileText,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface CertificadoItem {
  validade: string;
  dias_restantes: number;
  status: 'VALIDO' | 'ALERTA_VENCENDO' | 'EXPIRADO';
}

interface MedicoPlantonista {
  id: string;
  nome: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  situacao_cfm: string;
  certificados: {
    atls: CertificadoItem;
    acls: CertificadoItem;
    pals: CertificadoItem;
  };
  chave_pix: string;
  dados_bancarios: { banco: string; agencia: string; conta: string };
}

interface Plantao {
  id: string;
  setor: string;
  data_plantao: string;
  turno: string;
  medico_id: string;
  medico_nome: string;
  crm: string;
  valor_plantao: number;
  status: string;
  checkin?: {
    hora: string;
    latitude: number;
    longitude: number;
    distancia_metros: number;
    metodo: string;
    biometria_score_pct: number;
    valido: boolean;
  };
  antecipacao_solicitada?: {
    valor_bruto: number;
    taxa_desagio_pct: number;
    valor_liquido: number;
    chave_pix: string;
    status: string;
    comprovante_autenticacao: string;
    timestamp: string;
  };
}

type SecaoEscala = 'grade' | 'checkin' | 'trocas' | 'cofre' | 'despesas_hub' | 'perfis';

export default function EscalaMedicaPage() {
  const roles = MODULO_ROLES_CATALOG['escala-medica'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoEscala>('grade');
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [corpoClinico, setCorpoClinico] = useState<MedicoPlantonista[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modais de Ação
  const [plantaoAtivo, setPlantaoAtivo] = useState<Plantao | null>(null);
  const [modalAcao, setModalAcao] = useState<'CHECKIN' | 'TROCA' | 'ANTECIPAR_PIX' | 'COFRE_DOCS' | null>(null);
  const [substitutoId, setSubstitutoId] = useState<string>('');
  const [distanciaSimulada, setDistanciaSimulada] = useState<number>(25); // metros do hospital
  const [resultadoAcao, setResultadoAcao] = useState<any>(null);
  const [processando, setProcessando] = useState(false);

  // Estados de exportação para o Hub 360
  const [exportandoHub, setExportandoHub] = useState(false);
  const [feedbackExportacao, setFeedbackExportacao] = useState<{
    sucesso: boolean;
    mensagem: string;
    protocolo?: string;
    valorTotal?: number;
  } | null>(null);

  const carregarEscala = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/escala-medica');
      const data = await res.json();
      if (data.success) {
        setPlantoes(data.plantoes);
        setCorpoClinico(data.corpo_clinico);
        setMetricas(data.metricas);
        if (data.corpo_clinico.length > 1) {
          setSubstitutoId(data.corpo_clinico[1].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar escala médica:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Adiado para microtask: carregarEscala() seta estado de loading de forma síncrona.
    void Promise.resolve().then(() => carregarEscala());
  }, []);

  // Executar Check-in por GPS / Biometria
  const handleCheckinGPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      const latBase = -23.550520;
      const offsetLat = (distanciaSimulada / 111000);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'CHECKIN_PRESENCIAL',
          plantao_id: plantaoAtivo.id,
          latitude: latBase + offsetLat,
          longitude: -46.633308,
          metodo: 'GPS_BIOMETRIA_FACIAL'
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Executar Troca de Plantão
  const handleTrocaPlantao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'SOLICITAR_TROCA',
          plantao_id: plantaoAtivo.id,
          substituto_id: substitutoId,
          motivo_troca: 'Troca consensual de plantão validada com diretoria clínica'
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Antecipação PIX D+0
  const handleAnteciparPIX = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'ANTECIPAR_PAGAMENTO_PIX',
          plantao_id: plantaoAtivo.id
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Despacho de despesas para o Hub Central
  const handleExportarParaHub = async () => {
    try {
      setExportandoHub(true);
      setFeedbackExportacao(null);

      const res = await fetch('/api/escala-medica/despesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: '123.456.789-00' })
      });

      const data = await res.json();

      if (data.success) {
        setFeedbackExportacao({
          sucesso: true,
          mensagem: data.mensagem || 'Honorários médicos e plantões hospitalares exportados com sucesso ao Hub 360.',
          protocolo: data.protocolo_hub,
          valorTotal: data.valor_total_exportado
        });
      } else {
        setFeedbackExportacao({
          sucesso: false,
          mensagem: data.error || 'Falha ao sincronizar honorários com o Hub.'
        });
      }
    } catch (err: any) {
      setFeedbackExportacao({
        sucesso: false,
        mensagem: err?.message || 'Erro de conexão com o Hub 360.'
      });
    } finally {
      setExportandoHub(false);
    }
  };

  const menuItems = [
    { id: 'grade' as SecaoEscala, label: 'Grade & Plantões Ativos', icon: Calendar, badge: `${plantoes.length} Hoje` },
    { id: 'checkin' as SecaoEscala, label: 'Ponto GPS & Biometria', icon: Fingerprint, badge: '<100m' },
    { id: 'trocas' as SecaoEscala, label: 'Trocas & Substituições', icon: ArrowLeftRight },
    { id: 'cofre' as SecaoEscala, label: 'Cofre CFM & Certificados', icon: FileBadge, badge: `${corpoClinico.length} Docs` },
    { id: 'despesas_hub' as SecaoEscala, label: 'Exportar Honorários ao Hub', icon: UploadCloud, badge: 'Custo Paciente' },
    { id: 'perfis' as SecaoEscala, label: 'Perfis & Matriz RBAC', icon: ShieldCheck }
  ];

  return (
    <>
      <PageHeader
        activeTitle="Escala Médica & Plantonistas"
        activeSubtitle="Corpo Clínico, Ponto GPS <100m, CFM/ATLS, Trocas de Plantão e PIX D+0"
      />

      <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
        {/* BOTÃO MOBILE PARA ABRIR SIDEBAR */}
        <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#8A6A16] text-white rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-900">Menu Escala Médica</span>
          </div>
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
          >
            {sidebarAberta ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* SIDEBAR EXCLUSIVA DO PRODUTO: ESCALA MÉDICA & PLANTÕES */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-72 lg:w-64 shrink-0 bg-white border border-slate-200/80 rounded-3xl p-4
            flex flex-col justify-between shadow-sm transition-transform duration-200
            ${sidebarAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div>
            {/* CABEÇALHO DO PRODUTO */}
            <div className="flex items-center gap-3 p-3 bg-[#8A6A16]/[0.08] rounded-2xl border border-[#8A6A16]/[0.12] mb-4">
              <div className="p-2.5 bg-[#8A6A16] text-white rounded-xl shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-tight">Escala Médica 360</h2>
                <span className="text-[10px] font-semibold text-[#8A6A16] bg-[#8A6A16]/70 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                  Res. CFM 2.147
                </span>
              </div>
            </div>

            {/* SELEÇÃO VERTICAL DE SEÇÕES */}
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const ativa = secaoAtiva === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSecaoAtiva(item.id);
                      setSidebarAberta(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left
                      ${ativa
                        ? 'bg-[#8A6A16] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${ativa ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          ativa
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RODAPÉ DA SIDEBAR: VOLTAR AO HUB & STATUS OPERACIONAL */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Ponto Digital:</span>
                <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Geofence Ativo
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Ponto biométrico integrado ao CNAB 240 e PIX D+0.</p>
            </div>

            <Link
              href="/"
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <span>Voltar ao Hub de Módulos</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </aside>

        {/* OVERLAY ESCURO PARA MOBILE */}
        {sidebarAberta && (
          <div
            onClick={() => setSidebarAberta(false)}
            className="fixed inset-0 bg-slate-900/30 z-30 lg:hidden"
          />
        )}

        {/* ÁREA PRINCIPAL DE CONTEÚDO */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
          {secaoAtiva === 'perfis' && (
            <ModuloRbacBar
              moduloId="escala-medica"
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              accentColor="#8A6A16"
              lightBg="bg-[#8A6A16]/[0.08]"
              lightBorder="border-[#8A6A16]/20"
            />
          )}

          {/* KPIS GLOBAIS DO DIA */}
          {metricas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                title="Plantões Hoje"
                value={`${metricas.total_plantoes_hoje} Ativos`}
                subtitle="Escala Diurna/Noturna"
                icon={Calendar}
                tooltipInfo="Total de postos de plantão programados para as últimas 24 horas nas unidades de UTI Geral, Pronto-Socorro e Centro Cirúrgico, sem furos."
                trend={{ text: "100% Cobertos", isPositive: true }}
              />

              <KpiCard
                title="Presença GPS"
                value={`${metricas.taxa_presenca_geofence_pct}%`}
                subtitle="Ponto por Geofencing"
                icon={MapPin}
                tooltipInfo="Percentual de médicos que registraram entrada presencial no raio regulamentar de menos de 100 metros do hospital via satélite e biometria facial."
                trend={{ text: "Raio < 100m validado", isPositive: true }}
              />

              <KpiCard
                title="Certificados CFM"
                value={`${metricas.medicos_com_certificados_a_vencer_30d} Médicos`}
                subtitle="Alerta de Vencimento"
                icon={AlertTriangle}
                tooltipInfo="Profissionais com certificações críticas de emergência (ATLS, ACLS ou PALS) com vencimento previsto para os próximos 30 dias. Notificação emitida."
                trend={{ text: "Vencendo em 30d", isAlert: true }}
              />

              <KpiCard
                title="Remuneração do Dia"
                value={`R$ ${metricas.valor_total_escala_dia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Elegível para PIX D+0"
                icon={DollarSign}
                tooltipInfo="Volume financeiro total de honorários de plantão do dia, integrado com a esteira bancária para antecipação instantânea PIX e remessa CNAB 240."
                trend={{ text: "CNAB 240 Pronto", isPositive: false }}
              />
            </div>
          )}

          {/* SEÇÃO 1: GRADE DE PLANTÕES & ESCALA */}
          {secaoAtiva === 'grade' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Grade de Plantões Hospitalares (UTI, PS, Centro Cirúrgico)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Controle de presença em tempo real e batimento de ponto com reconhecimento facial.
                  </p>
                </div>
                <button
                  onClick={() => setSecaoAtiva('despesas_hub')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#8A6A16] bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-xl hover:bg-[#6E5511]/[0.12] transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Exportar Custos ao Hub</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Setor &amp; Turno</th>
                      <th className="py-3 px-4">Médico Plantonista</th>
                      <th className="py-3 px-4">Status &amp; Ponto GPS</th>
                      <th className="py-3 px-4 text-right">Valor Plantão</th>
                      <th className="py-3 px-4 text-center">Ações Operacionais</th>
                      <th className="py-3 px-4 text-center">Financeiro (PIX D+0)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plantoes.map((p) => {
                      const checkinFeito = p.status === 'CHECKIN_REALIZADO' || p.status === 'CONCLUIDO';
                      const antecipado = p.antecipacao_solicitada?.status === 'PAGO_PIX_D0';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{p.setor.replace('_', ' ')}</span>
                            <span className="text-xs text-slate-500">{p.turno.replace('_', ' ')} • {p.data_plantao}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{p.medico_nome}</span>
                            <span className="text-xs text-[#8A6A16] font-semibold">{p.crm}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {checkinFeito && p.checkin ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Presente ({p.checkin.hora})
                                </span>
                                <span className="block text-[10px] text-slate-500 mt-0.5">
                                  GPS: {p.checkin.distancia_metros}m do Hospital • Bio {p.checkin.biometria_score_pct}%
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Aguardando Check-in
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            R$ {p.valor_plantao.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setPlantaoAtivo(p);
                                  setModalAcao('CHECKIN');
                                  setResultadoAcao(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                <Fingerprint className="w-3 h-3" />
                                <span>Bater Ponto</span>
                              </button>
                              <button
                                onClick={() => {
                                  setPlantaoAtivo(p);
                                  setModalAcao('TROCA');
                                  setResultadoAcao(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-300"
                              >
                                <ArrowLeftRight className="w-3 h-3 text-[#8A6A16]" />
                                <span>Trocar</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {antecipado ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                PIX D+0 Pago (R$ {p.antecipacao_solicitada?.valor_liquido.toFixed(2)})
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setPlantaoAtivo(p);
                                  setModalAcao('ANTECIPAR_PIX');
                                  setResultadoAcao(null);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#8A6A16] hover:bg-[#6E5511] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Antecipar PIX</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: PONTO GPS & BIOMETRIA FACIAL */}
          {secaoAtiva === 'checkin' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Validador de Ponto por Geofencing GPS &amp; Biometria
                </h3>
                <p className="text-xs text-slate-500">
                  Resolução CFM nº 2.147 — O registro de presença exige perímetro inferior a 100 metros das coordenadas hospitalares.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2 text-[#8A6A16]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Coordenadas Hospital</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-800">-23.550520, -46.633308</p>
                  <p className="text-[11px] text-slate-500 mt-1">Raio de Validação: 100 metros</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700">
                    <Fingerprint className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Liveness Facial</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-900">Anti-Spoofing Ativo</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Threshold de Aceite: ≥ 98.0%</p>
                </div>

                <div className="p-4 bg-[#8A6A16]/[0.08] rounded-2xl border border-[#8A6A16]/20">
                  <div className="flex items-center gap-2 mb-2 text-[#8A6A16]">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Gatilho Automático</span>
                  </div>
                  <p className="text-xs font-bold text-[#8A6A16]">Liberação de PIX D+0</p>
                  <p className="text-[11px] text-[#8A6A16] mt-1">Gera remessa no encerramento</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Simulador de Perímetro GPS</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={distanciaSimulada}
                    onChange={e => setDistanciaSimulada(Number(e.target.value))}
                    className="flex-1 accent-[#8A6A16]"
                  />
                  <span className="font-mono text-xs font-bold px-3 py-1 bg-white border border-slate-300 rounded-lg">
                    {distanciaSimulada} metros
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={distanciaSimulada <= 100 ? 'text-emerald-700' : 'text-rose-600'}>
                    {distanciaSimulada <= 100
                      ? '✅ Perímetro Válido: Ponto permitido para confirmação'
                      : '❌ Perímetro Inválido: Distância superior a 100 metros'}
                  </span>
                  <span className="text-slate-400 text-[11px]">Precisão GPS: ±2.4m</span>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 3: TROCAS & SUBSTITUIÇÕES */}
          {secaoAtiva === 'trocas' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Gestão de Trocas Consensuais de Plantão (Sem Furos na Escala)
                </h3>
                <p className="text-xs text-slate-500">
                  Regra de ouro: Apenas médicos com CRM regular e certificações ATLS/ACLS válidas podem assumir plantões de emergência.
                </p>
              </div>

              <div className="p-4 bg-[#8A6A16]/50 rounded-2xl border border-[#8A6A16]/[0.12] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8A6A16] shrink-0 mt-0.5" />
                <div className="text-xs text-[#8A6A16]">
                  <strong className="block font-bold mb-0.5">Protocolo de Segurança Clínica</strong>
                  Toda solicitação de troca exige aceite mútuo digital e validação dos certificados de urgência no Conselho Regional de Medicina antes da homologação final.
                </div>
              </div>

              <div className="space-y-3">
                {plantoes.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{p.setor.replace('_', ' ')}</span>
                        <span className="text-[10px] text-[#8A6A16] bg-[#8A6A16]/[0.12] px-2 py-0.5 rounded-md font-semibold">
                          {p.turno.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Plantonista Titular: <strong>{p.medico_nome}</strong> ({p.crm})</p>
                    </div>
                    <button
                      onClick={() => {
                        setPlantaoAtivo(p);
                        setModalAcao('TROCA');
                        setResultadoAcao(null);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-[#8A6A16]" />
                      <span>Solicitar Substituição</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO 4: COFRE CFM & CERTIFICAÇÕES */}
          {secaoAtiva === 'cofre' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cofre Digital CFM &amp; Certificações Médicas de Emergência
                </h3>
                <p className="text-xs text-slate-500">
                  Guarda documental imutável, consulta ao CFM e alerta preditivo de vencimento de ATLS, ACLS e PALS.
                </p>
              </div>

              <div className="space-y-4">
                {corpoClinico.map((med) => (
                  <div key={med.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{med.nome}</h4>
                        <p className="text-xs text-[#8A6A16] font-semibold">{med.crm} • {med.especialidade}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CFM: {med.situacao_cfm}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                      <div className={`p-2.5 rounded-xl border ${med.certificados.atls.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">ATLS (Trauma)</span>
                        <strong className="text-xs">{med.certificados.atls.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.atls.dias_restantes}d restantes</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${med.certificados.acls.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">ACLS (Cardíaco)</span>
                        <strong className="text-xs">{med.certificados.acls.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.acls.dias_restantes}d restantes</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${med.certificados.pals.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">PALS (Pediátrico)</span>
                        <strong className="text-xs">{med.certificados.pals.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.pals.dias_restantes}d restantes</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-1">
                      <span>Chave PIX: <strong className="text-slate-800">{med.chave_pix}</strong></span>
                      <span>Banco: {med.dados_bancarios.banco} • Agência: {med.dados_bancarios.agencia}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO 5: EXPORTAÇÃO DE HONORÁRIOS AO HUB 360 */}
          {secaoAtiva === 'despesas_hub' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Exportação de Honorários Médicos &amp; Plantões ao Hub 360
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rateio de horas assistenciais por paciente-dia para apuração do custo real Door-to-Door (Estação 5).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/api/hub/despesas/exportar?formato=csv&origem=ESCALA_MEDICA"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar CSV</span>
                  </a>
                  <a
                    href="/api/hub/despesas/exportar?formato=json&origem=ESCALA_MEDICA"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Baixar JSON</span>
                  </a>
                </div>
              </div>

              {/* DEMONSTRATIVO DE HONORÁRIOS APURADOS */}
              <div className="p-4 bg-[#8A6A16]/60 rounded-2xl border border-[#8A6A16]/[0.12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8A6A16] uppercase tracking-wider">
                    Paciente Referência: Carlos Eduardo Silveira (123.456.789-00)
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    R$ 1.770,00 em Honorários Intensivistas &amp; Cirúrgicos
                  </h4>
                  <p className="text-xs text-slate-600">
                    4.5h UTI Horizontal (Dr. Roberto Albuquerque) + 3.0h Ato Cirúrgico Ortopédico (Dra. Camila Vasconcelos).
                  </p>
                </div>

                <button
                  onClick={handleExportarParaHub}
                  disabled={exportandoHub}
                  className="px-5 py-2.5 bg-[#8A6A16] hover:bg-[#6E5511] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{exportandoHub ? 'Sincronizando...' : 'Sincronizar com Hub 360'}</span>
                </button>
              </div>

              {/* FEEDBACK DA EXPORTAÇÃO */}
              {feedbackExportacao && (
                <div
                  className={`p-4 rounded-2xl text-xs font-semibold border ${
                    feedbackExportacao.sucesso
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {feedbackExportacao.sucesso ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="font-bold">
                      {feedbackExportacao.sucesso ? 'Sincronização Concluída!' : 'Erro na Exportação'}
                    </span>
                  </div>
                  <p>{feedbackExportacao.mensagem}</p>
                  {feedbackExportacao.protocolo && (
                    <p className="mt-2 text-[11px] font-mono text-emerald-800">
                      Protocolo Hub: <strong>{feedbackExportacao.protocolo}</strong> • Valor Imputado: R$ {feedbackExportacao.valorTotal?.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 6: PERFIS & MATRIZ RBAC */}
          {secaoAtiva === 'perfis' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Matriz RBAC do Módulo Escala Médica &amp; Plantonistas
                </h3>
                <p className="text-xs text-slate-500">
                  Perfis regulamentares conforme diretrizes de governança clínica e Resolução CFM 2.147.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {roles.map(role => (
                  <div key={role.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20">
                        {role.level}
                      </span>
                      {role.id === activeRole.id && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Ativo
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{role.name}</h4>
                    <p className="text-xs text-slate-600 mb-3">{role.description}</p>
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      Responsável: <strong>{role.responsavelPadrao}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAIS OPERACIONAIS: CHECK-IN, TROCA, PIX */}
      {plantaoAtivo && modalAcao === 'CHECKIN' && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#8A6A16] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[#8A6A16]/20" />
                <h3 className="font-bold text-base">Check-in Presencial Seguro</h3>
              </div>
              <button
                onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckinGPS} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Plantonista</span>
                <p className="font-bold text-slate-900">{plantaoAtivo.medico_nome}</p>
                <p className="text-xs text-slate-500">{plantaoAtivo.crm} • Setor: {plantaoAtivo.setor}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Simulação Geofencing GPS (Distância do Hospital)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={distanciaSimulada}
                    onChange={e => setDistanciaSimulada(Number(e.target.value))}
                    className="w-full accent-[#8A6A16]"
                  />
                  <span className="text-xs font-mono font-bold w-16 text-right">
                    {distanciaSimulada}m
                  </span>
                </div>
                <span className={`text-[11px] block mt-1 font-semibold ${distanciaSimulada <= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {distanciaSimulada <= 100 ? '✅ Dentro do raio hospitalar (<100m)' : '❌ Fora do perímetro permitido (>100m)'}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Reconhecimento facial biométrico pronto: Score 99.4%</span>
              </div>

              {resultadoAcao && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                  {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="px-5 py-2.5 bg-[#8A6A16] hover:bg-[#6E5511] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  {processando ? 'Validando...' : 'Confirmar Presença'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {plantaoAtivo && modalAcao === 'TROCA' && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#8A6A16] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#8A6A16]/20" />
                <h3 className="font-bold text-base">Solicitar Troca de Plantão</h3>
              </div>
              <button
                onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTrocaPlantao} className="p-6 space-y-4">
              <div className="p-4 bg-[#8A6A16]/50 rounded-2xl border border-[#8A6A16]/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Titular Ofertante</span>
                <p className="font-bold text-slate-900">{plantaoAtivo.medico_nome}</p>
                <p className="text-xs text-slate-600">{plantaoAtivo.crm} • Setor: {plantaoAtivo.setor}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Médico Substituto Homologado
                </label>
                <select
                  value={substitutoId}
                  onChange={e => setSubstitutoId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#8A6A16]"
                >
                  {corpoClinico.filter(m => m.id !== plantaoAtivo.medico_id).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.crm} - {m.especialidade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-xl text-xs text-[#8A6A16] font-semibold">
                🛡️ <strong>Regra de Ouro:</strong> A substituição é confirmada imediatamente após conferência automática do CRM e certificados de trauma (ATLS/ACLS) no CFM.
              </div>

              {resultadoAcao && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                  {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="px-5 py-2.5 bg-[#8A6A16] hover:bg-[#6E5511] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {processando ? 'Aprovando...' : 'Homologar Troca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {plantaoAtivo && modalAcao === 'ANTECIPAR_PIX' && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#8A6A16] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Antecipação Instantânea PIX (D+0)</h3>
              </div>
              <button
                onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAnteciparPIX} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Resumo da Operação</span>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span>Valor Bruto do Plantão:</span>
                  <strong className="text-slate-900">R$ {plantaoAtivo.valor_plantao.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-rose-600">
                  <span>Taxa de Deságio (3.5%):</span>
                  <strong>- R$ {(plantaoAtivo.valor_plantao * 0.035).toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 font-bold text-sm text-emerald-700">
                  <span>Líquido a Receber no PIX:</span>
                  <span>R$ {(plantaoAtivo.valor_plantao * 0.965).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                ⚡ O valor será transferido na hora para a chave PIX cadastrada do médico e registrado no Lote CNAB 240 para conciliação contábil com o hospital.
              </div>

              {resultadoAcao && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                  {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {processando ? 'Transferindo...' : 'Transferir no PIX Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
