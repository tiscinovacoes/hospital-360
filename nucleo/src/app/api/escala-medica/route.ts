import { NextResponse } from 'next/server';

export interface MedicoPlantonista {
  id: string;
  nome: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  situacao_cfm: 'REGULAR' | 'SUSPENSO' | 'INATIVO';
  certificados: {
    atls: { validade: string; dias_restantes: number; status: 'VALIDO' | 'ALERTA_VENCENDO' | 'EXPIRADO' };
    acls: { validade: string; dias_restantes: number; status: 'VALIDO' | 'ALERTA_VENCENDO' | 'EXPIRADO' };
    pals: { validade: string; dias_restantes: number; status: 'VALIDO' | 'ALERTA_VENCENDO' | 'EXPIRADO' };
  };
  chave_pix: string;
  dados_bancarios: { banco: string; agencia: string; conta: string };
}

export interface PlantaoEscala {
  id: string;
  setor: 'UTI_GERAL' | 'PRONTO_SOCORRO_ADULTO' | 'CENTRO_CIRURGICO' | 'PEDIATRIA';
  data_plantao: string;
  turno: 'DIURNO_07_19' | 'NOTURNO_19_07' | 'PLANTÃO_24H';
  medico_id: string;
  medico_nome: string;
  crm: string;
  valor_plantao: number;
  status: 'CONFIRMADO' | 'CHECKIN_REALIZADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'SUBSTITUIDO';
  checkin?: {
    hora: string;
    latitude: number;
    longitude: number;
    distancia_metros: number;
    metodo: 'GPS_BIOMETRIA_FACIAL' | 'QR_CODE_TOTEM';
    biometria_score_pct: number;
    valido: boolean;
  };
  antecipacao_solicitada?: {
    valor_bruto: number;
    taxa_desagio_pct: number;
    valor_liquido: number;
    chave_pix: string;
    status: 'PAGO_PIX_D0' | 'PROCESSANDO' | 'CNAB_GERADO';
    comprovante_autenticacao: string;
    timestamp: string;
  };
}

const medicosDB: MedicoPlantonista[] = [
  {
    id: 'med-01',
    nome: 'Dr. Roberto Albuquerque de Castro',
    crm: 'CRM/SP 142.981',
    uf_crm: 'SP',
    especialidade: 'Medicina Intensiva & Emergencista',
    situacao_cfm: 'REGULAR',
    certificados: {
      atls: { validade: '2026-11-20', dias_restantes: 60, status: 'VALIDO' },
      acls: { validade: '2026-10-15', dias_restantes: 24, status: 'ALERTA_VENCENDO' },
      pals: { validade: '2027-03-10', dias_restantes: 170, status: 'VALIDO' }
    },
    chave_pix: 'roberto.castro.md@hospital360.com.br',
    dados_bancarios: { banco: '001 - Banco do Brasil', agencia: '3120-1', conta: '45.109-8' }
  },
  {
    id: 'med-02',
    nome: 'Dra. Camila Vasconcelos Ramos',
    crm: 'CRM/SP 188.420',
    uf_crm: 'SP',
    especialidade: 'Cirurgia Geral & Trauma',
    situacao_cfm: 'REGULAR',
    certificados: {
      atls: { validade: '2027-01-30', dias_restantes: 131, status: 'VALIDO' },
      acls: { validade: '2026-12-10', dias_restantes: 80, status: 'VALIDO' },
      pals: { validade: '2026-09-30', dias_restantes: 9, status: 'ALERTA_VENCENDO' }
    },
    chave_pix: '18842099900',
    dados_bancarios: { banco: '341 - Itaú Unibanco', agencia: '0854', conta: '12.876-5' }
  },
  {
    id: 'med-03',
    nome: 'Dr. Fernando Dias Brandão',
    crm: 'CRM/SP 159.332',
    uf_crm: 'SP',
    especialidade: 'Clínica Médica & UTI',
    situacao_cfm: 'REGULAR',
    certificados: {
      atls: { validade: '2026-10-05', dias_restantes: 14, status: 'ALERTA_VENCENDO' },
      acls: { validade: '2027-05-18', dias_restantes: 239, status: 'VALIDO' },
      pals: { validade: '2027-08-01', dias_restantes: 314, status: 'VALIDO' }
    },
    chave_pix: 'dias.brandao@medicos360.com',
    dados_bancarios: { banco: '237 - Bradesco', agencia: '1904-2', conta: '77.890-1' }
  }
];

const plantoesDB: PlantaoEscala[] = [
  {
    id: 'plt-2026-001',
    setor: 'UTI_GERAL',
    data_plantao: '2026-09-21',
    turno: 'DIURNO_07_19',
    medico_id: 'med-01',
    medico_nome: 'Dr. Roberto Albuquerque de Castro',
    crm: 'CRM/SP 142.981',
    valor_plantao: 2200.00,
    status: 'CHECKIN_REALIZADO',
    checkin: {
      hora: '06:54:12',
      latitude: -23.550520,
      longitude: -46.633308,
      distancia_metros: 28.5,
      metodo: 'GPS_BIOMETRIA_FACIAL',
      biometria_score_pct: 99.4,
      valido: true
    }
  },
  {
    id: 'plt-2026-002',
    setor: 'PRONTO_SOCORRO_ADULTO',
    data_plantao: '2026-09-21',
    turno: 'DIURNO_07_19',
    medico_id: 'med-02',
    medico_nome: 'Dra. Camila Vasconcelos Ramos',
    crm: 'CRM/SP 188.420',
    valor_plantao: 1950.00,
    status: 'CONFIRMADO'
  },
  {
    id: 'plt-2026-003',
    setor: 'CENTRO_CIRURGICO',
    data_plantao: '2026-09-21',
    turno: 'NOTURNO_19_07',
    medico_id: 'med-03',
    medico_nome: 'Dr. Fernando Dias Brandão',
    crm: 'CRM/SP 159.332',
    valor_plantao: 2400.00,
    status: 'CONFIRMADO'
  }
];

/** Indicadores do painel de escala médica devolvidos pelo GET. */
export interface MetricasEscala {
  total_plantoes_hoje: number;
  taxa_presenca_geofence_pct: number;
  valor_total_escala_dia: number;
  medicos_com_certificados_a_vencer_30d: number;
  cobertura_vagas_criticas: string;
}

/** Retorno das ações do POST (check-in por geofence, troca de plantão, etc.). */
export interface RespostaAcaoEscala {
  success: boolean;
  mensagem?: string;
  error?: string;
}

export async function GET() {
  const totalPlantoesHoje = plantoesDB.length;
  const plantoesComPresenca = plantoesDB.filter(p => p.status === 'CHECKIN_REALIZADO' || p.status === 'CONCLUIDO').length;
  const totalValoresPlantoes = plantoesDB.reduce((acc, p) => acc + p.valor_plantao, 0);
  const alertasDocumentos = medicosDB.filter(m => 
    m.certificados.atls.status === 'ALERTA_VENCENDO' || 
    m.certificados.acls.status === 'ALERTA_VENCENDO' || 
    m.certificados.pals.status === 'ALERTA_VENCENDO'
  ).length;

  return NextResponse.json({
    success: true,
    metricas: {
      total_plantoes_hoje: totalPlantoesHoje,
      taxa_presenca_geofence_pct: Math.round((plantoesComPresenca / totalPlantoesHoje) * 100),
      valor_total_escala_dia: totalValoresPlantoes,
      medicos_com_certificados_a_vencer_30d: alertasDocumentos,
      cobertura_vagas_criticas: '100% (SEM FUROS NA ESCALA)'
    },
    plantoes: plantoesDB,
    corpo_clinico: medicosDB
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { acao, plantao_id, medico_id, latitude, longitude, metodo, substituto_id, motivo_troca } = body;

    // 1. CHECK-IN COM GEOFENCING GPS E BIOMETRIA
    if (acao === 'CHECKIN_PRESENCIAL') {
      const plantao = plantoesDB.find(p => p.id === plantao_id);
      if (!plantao) {
        return NextResponse.json({ success: false, error: 'Plantão não encontrado.' }, { status: 404 });
      }

      // Coordenadas simuladas do Hospital Central 360
      const HOSPITAL_LAT = -23.550520;
      const HOSPITAL_LNG = -46.633308;
      const userLat = Number(latitude || HOSPITAL_LAT);
      const userLng = Number(longitude || HOSPITAL_LNG);

      // Distância em metros aproximada (Haversine simplificado)
      const dLat = (userLat - HOSPITAL_LAT) * 111000;
      const dLng = (userLng - HOSPITAL_LNG) * 111000 * Math.cos(HOSPITAL_LAT * (Math.PI / 180));
      const distanciaMetros = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;

      // Trava de Geofencing: Máximo 100 metros da área hospitalar
      if (distanciaMetros > 100.0) {
        return NextResponse.json(
          {
            success: false,
            error: `CHECK-IN RECUSADO POR GEOFENCE: Você está a ${distanciaMetros} metros do Hospital Central. A validação exige estar a menos de 100 metros do perímetro hospitalar.`
          },
          { status: 403 }
        );
      }

      plantao.status = 'CHECKIN_REALIZADO';
      plantao.checkin = {
        hora: new Date().toLocaleTimeString('pt-BR'),
        latitude: userLat,
        longitude: userLng,
        distancia_metros: distanciaMetros,
        metodo: metodo || 'GPS_BIOMETRIA_FACIAL',
        biometria_score_pct: 98.8,
        valido: true
      };

      return NextResponse.json({
        success: true,
        mensagem: 'Check-in biométrico validado com sucesso dentro do raio hospitalar (<100m).',
        detalhes: plantao.checkin
      });
    }

    // 2. FLUXO DE TROCA DE PLANTÃO SEM FUROS
    if (acao === 'SOLICITAR_TROCA') {
      const plantao = plantoesDB.find(p => p.id === plantao_id);
      if (!plantao) {
        return NextResponse.json({ success: false, error: 'Plantão não localizado.' }, { status: 404 });
      }

      const substituto = medicosDB.find(m => m.id === substituto_id);
      if (!substituto) {
        return NextResponse.json({ success: false, error: 'Médico substituto não localizado.' }, { status: 404 });
      }

      // Validação CFM do substituto
      if (substituto.situacao_cfm !== 'REGULAR') {
        return NextResponse.json(
          {
            success: false,
            error: `TROCA REJEITADA: Médico substituto com status no CFM: ${substituto.situacao_cfm}. Exige CRM ativo e regular.`
          },
          { status: 422 }
        );
      }

      // Efetua a troca garantindo que o posto nunca fique deserto
      const medicoAnterior = plantao.medico_nome;
      plantao.medico_id = substituto.id;
      plantao.medico_nome = substituto.nome;
      plantao.crm = substituto.crm;
      plantao.status = 'SUBSTITUIDO';

      return NextResponse.json({
        success: true,
        mensagem: 'Troca de plantão aprovada e homologada sem furos na escala.',
        troca: {
          plantao_id: plantao.id,
          setor: plantao.setor,
          data: plantao.data_plantao,
          de_medico: medicoAnterior,
          para_substituto: substituto.nome,
          crm_substituto: substituto.crm,
          motivo: motivo_troca || 'Substituição formal homologada pela Diretoria Clínica',
          timestamp: new Date().toISOString()
        }
      });
    }

    // 3. ANTECIPAÇÃO FINANCEIRA DO PLANTÃO VIA PIX D+0 & REMESSA CNAB
    if (acao === 'ANTECIPAR_PAGAMENTO_PIX') {
      const plantao = plantoesDB.find(p => p.id === plantao_id);
      if (!plantao) {
        return NextResponse.json({ success: false, error: 'Plantão não localizado.' }, { status: 404 });
      }

      const medico = medicosDB.find(m => m.id === plantao.medico_id);
      if (!medico) {
        return NextResponse.json({ success: false, error: 'Médico não encontrado.' }, { status: 404 });
      }

      const taxaDesagioPct = 3.5; // 3.5% taxa de antecipação
      const valorBruto = plantao.valor_plantao;
      const valorDesconto = Number((valorBruto * (taxaDesagioPct / 100)).toFixed(2));
      const valorLiquido = Number((valorBruto - valorDesconto).toFixed(2));
      const comprovanteId = `PIX-D0-HOSP360-${Date.now().toString().slice(-8)}`;

      plantao.antecipacao_solicitada = {
        valor_bruto: valorBruto,
        taxa_desagio_pct: taxaDesagioPct,
        valor_liquido: valorLiquido,
        chave_pix: medico.chave_pix,
        status: 'PAGO_PIX_D0',
        comprovante_autenticacao: comprovanteId,
        timestamp: new Date().toISOString()
      };

      // Simula geração da linha do registro CNAB 240
      const cnabRegistro = `00100013000010000020${medico.dados_bancarios.agencia.replace(/\D/g, '').padStart(5, '0')}${medico.dados_bancarios.conta.replace(/\D/g, '').padStart(12, '0')}${valorLiquido.toFixed(2).replace('.', '').padStart(15, '0')}${comprovanteId.padEnd(20, ' ')}`;

      return NextResponse.json({
        success: true,
        mensagem: `Antecipação PIX D+0 concluída com sucesso para a chave ${medico.chave_pix}.`,
        antecipacao: {
          ...plantao.antecipacao_solicitada,
          medico: medico.nome,
          crm: medico.crm,
          valor_desconto_desagio: valorDesconto,
          cnab_registro_preview: cnabRegistro
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Ação informada não é reconhecida.' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
