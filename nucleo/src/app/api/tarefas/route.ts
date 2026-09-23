import { NextRequest, NextResponse } from 'next/server';
import { mensagemErro } from '@/lib/utils';

export interface TarefaHospitalar {
  id: string;
  titulo: string;
  categoria: 'ENFERMAGEM' | 'FACILITIES' | 'MANUTENCAO' | 'FARMACIA';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'PROGRAMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  localizacao: string; // Ex: Leito 204B, Leito 108, Farmácia Central
  leitoId?: string;
  cpfPaciente?: string;
  nomePaciente?: string;
  responsavelNome: string;
  responsavelCargo: string;
  custoHoraProfissional: number; // Origem RH
  horarioProgramado: string;
  horarioInicio?: string;
  horarioConclusao?: string;
  duracaoMinutos?: number;
  custoCalculadoMaoObra?: number;
  qrCodeExigido?: string; // QR code esperado no leito/pulseira
  checklist: Array<{ item: string; concluido: boolean }>;
  observacao?: string;
}

// Mock inicial com tarefas de diferentes setores da Sprint 2
const TAREFAS_MEMORIA: TarefaHospitalar[] = [
  {
    id: 'TSK-101',
    titulo: 'Administração de Ceftriaxona 1g IV (FEFO L-9941)',
    categoria: 'ENFERMAGEM',
    prioridade: 'ALTA',
    status: 'EM_ANDAMENTO',
    localizacao: 'Leito 204B — 2º Andar Ala Sul',
    leitoId: 'LEITO-204B',
    cpfPaciente: '123.456.789-00',
    nomePaciente: 'Carlos Eduardo Silveira',
    responsavelNome: 'Juliana Mendes',
    responsavelCargo: 'Técnica de Enfermagem',
    custoHoraProfissional: 45.0,
    horarioProgramado: '11:00',
    horarioInicio: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 min atrás
    qrCodeExigido: 'QR-PULSEIRA-123456',
    checklist: [
      { item: 'Conferir identificação dupla na pulseira', concluido: true },
      { item: 'Validar lote e validade com a prescrição médica', concluido: true },
      { item: 'Infundir medicamento e observar reações adversas', concluido: false },
    ],
  },
  {
    id: 'TSK-102',
    titulo: 'Higienização Terminal & Desinfecção Química Leito 108',
    categoria: 'FACILITIES',
    prioridade: 'URGENTE',
    status: 'PROGRAMADA',
    localizacao: 'Leito 108 — 1º Andar Internação',
    leitoId: 'LEITO-108',
    responsavelNome: 'Marcos Aurelio',
    responsavelCargo: 'Auxiliar de Governança / Facilities',
    custoHoraProfissional: 32.0,
    horarioProgramado: '11:30',
    qrCodeExigido: 'QR-LEITO-108',
    checklist: [
      { item: 'Retirada do enxoval hospitalar para lavanderia', concluido: false },
      { item: 'Aplicação de desinfetante hospitalar de alto nível', concluido: false },
      { item: 'Montagem de cama com enxoval estéril lacrado', concluido: false },
    ],
  },
  {
    id: 'TSK-103',
    titulo: 'Calibração Preventiva de Bomba de Infusão Contínua',
    categoria: 'MANUTENCAO',
    prioridade: 'MEDIA',
    status: 'PROGRAMADA',
    localizacao: 'UTI Geral — Box 04',
    responsavelNome: 'Eng. Roberto Faria',
    responsavelCargo: 'Engenheiro Clínico (Sabia)',
    custoHoraProfissional: 95.0,
    horarioProgramado: '14:00',
    qrCodeExigido: 'QR-EQUIP-BOMBA-092',
    checklist: [
      { item: 'Teste de vazão volumétrica com simulador', concluido: false },
      { item: 'Verificação da bateria de emergência', concluido: false },
      { item: 'Etiqueta de calibração Sabia 2026 fixada', concluido: false },
    ],
  },
  {
    id: 'TSK-104',
    titulo: 'Separação e Picking de Prescrições do Turno Noturno',
    categoria: 'FARMACIA',
    prioridade: 'ALTA',
    status: 'PROGRAMADA',
    localizacao: 'Farmácia Central / Estoque FEFO',
    responsavelNome: 'Farm. Carla Neves',
    responsavelCargo: 'Farmacêutica Hospitalar',
    custoHoraProfissional: 68.0,
    horarioProgramado: '15:30',
    qrCodeExigido: 'QR-FARMACIA-BOX-A',
    checklist: [
      { item: 'Conferência de validade FEFO dos antibióticos', concluido: false },
      { item: 'Identificação por código de barras de cada dose unitária', concluido: false },
      { item: 'Acondicionamento em caixas térmicas com sensor de temperatura', concluido: false },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const categoria = searchParams.get('categoria');

  let filtradas = [...TAREFAS_MEMORIA];
  if (status) filtradas = filtradas.filter((t) => t.status === status);
  if (categoria) filtradas = filtradas.filter((t) => t.categoria === categoria);

  return NextResponse.json({
    success: true,
    data: filtradas,
    error: null,
    meta: {
      total: filtradas.length,
      timestamp: new Date().toISOString(),
      version: 'v2.0-sprint2',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tarefaId, qrCodeLido, observacao } = body;

    const tarefa = TAREFAS_MEMORIA.find((t) => t.id === tarefaId);
    if (!tarefa) {
      return NextResponse.json(
        { success: false, data: null, error: 'Tarefa não encontrada.' },
        { status: 404 }
      );
    }

    if (action === 'INICIAR') {
      tarefa.status = 'EM_ANDAMENTO';
      tarefa.horarioInicio = new Date().toISOString();
      return NextResponse.json({
        success: true,
        data: tarefa,
        mensagem: 'Tarefa iniciada com sucesso. Cronômetro de execução ativado.',
      });
    }

    if (action === 'BAIXA' || action === 'CONCLUIR') {
      const inicio = tarefa.horarioInicio ? new Date(tarefa.horarioInicio).getTime() : Date.now() - 1000 * 60 * 15;
      const agora = Date.now();
      const duracaoMinutos = Math.max(1, Math.round((agora - inicio) / (1000 * 60)));
      const duracaoHoras = duracaoMinutos / 60;
      const custoMaoObra = Number((duracaoHoras * tarefa.custoHoraProfissional).toFixed(2));

      tarefa.status = 'CONCLUIDA';
      tarefa.horarioConclusao = new Date().toISOString();
      tarefa.duracaoMinutos = duracaoMinutos;
      tarefa.custoCalculadoMaoObra = custoMaoObra;
      tarefa.observacao = observacao || 'Baixa realizada pelo aplicativo com validação de presença QR Code.';
      tarefa.checklist.forEach((c) => (c.concluido = true));

      // Se for higienização de leito (Facilities), gera evento de liberação de leito no censo Bahmni
      const isLeitoHigienizacao = tarefa.categoria === 'FACILITIES' && Boolean(tarefa.leitoId);

      const eventoCusto = {
        tipo: tarefa.cpfPaciente ? 'CUSTO_DIRETO_ASSISTENCIAL' : 'CUSTO_INDIRETO_FACILITIES',
        origemModulo: `APP_TAREFAS_${tarefa.categoria}`,
        paciente: tarefa.nomePaciente || null,
        cpf: tarefa.cpfPaciente || null,
        leitoId: tarefa.leitoId || null,
        localizacao: tarefa.localizacao,
        duracao: `${duracaoMinutos} min`,
        valorCusto: custoMaoObra,
        responsavel: `${tarefa.responsavelNome} (${tarefa.responsavelCargo})`,
        censoHospitalarLiberado: isLeitoHigienizacao ? 'LEITO_LIBERADO_CENSO_BAHMNI' : null,
      };

      return NextResponse.json({
        success: true,
        data: {
          tarefa,
          eventoCustoIntegrado: eventoCusto,
          leitoLiberado: isLeitoHigienizacao,
        },
        mensagem: `Baixa da tarefa efetuada! Custo de mão de obra (R$ ${custoMaoObra}) integrado à jornada 360.${
          isLeitoHigienizacao ? ` Leito ${tarefa.leitoId} liberado no Censo do Bahmni-Core!` : ''
        }`,
      });
    }

    return NextResponse.json(
      { success: false, data: null, error: 'Ação inválida.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: mensagemErro(error, 'Erro interno.') },
      { status: 500 }
    );
  }
}
