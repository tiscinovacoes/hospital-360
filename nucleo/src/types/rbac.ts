export type PermissionAction = 
  | 'READ'       // Visualização de dados e dashboards
  | 'CREATE'     // Criação de novos registros (pedidos, requisições, cadastros)
  | 'UPDATE'     // Edição de registros existentes
  | 'DELETE'     // Cancelamento ou exclusão
  | 'APPROVE'    // Aprovação técnica, orçamentária ou clínica
  | 'AUDIT'      // Acesso a trilhas de log, conformidade TCU/ANVISA/LGPD
  | 'EXPORT';    // Exportação de relatórios, planilhas e relatórios oficiais

export type RoleLevel = 'operacional' | 'supervisao' | 'diretoria' | 'auditoria';

export interface ModuloRole {
  id: string;
  name: string;
  description: string;
  level: RoleLevel;
  permissions: PermissionAction[];
  badges: string[];
  responsavelPadrao: string;
}

export type ModuloId =
  | 'compras-publicas'
  | 'estoque-central'
  | 'escala-medica'
  | 'farmacia-estoque'
  | 'gestao-clinica'
  | 'laboratorio'
  | 'leitos-censo'
  | 'financeiro-split'
  | 'automacao-mensageria'
  | 'ingestao-modulos'
  | 'arquitetura-seguranca'
  | 'dashboard-executivo';

export const MODULO_ROLES_CATALOG: Record<ModuloId, ModuloRole[]> = {
  'compras-publicas': [
    {
      id: 'pregoeiro_comprador',
      name: 'Comprador / Pregoeiro',
      description: 'Lança pedidos, gerencia atas de preço e pesquisa no banco CMED.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE', 'EXPORT'],
      badges: ['Operacional', 'Elaboração'],
      responsavelPadrao: 'Carlos E. Menezes (Matrícula: CP-4091)'
    },
    {
      id: 'gestor_contratos',
      name: 'Gestor de Atas e Contratos',
      description: 'Gerencia vigência de contratos, aditivos, fracionamento de atas e saldos.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['Supervisão', 'Contratos'],
      responsavelPadrao: 'Mariana Duarte (OAB/SP 312.441)'
    },
    {
      id: 'ordenador_despesa',
      name: 'Ordenador de Despesa / Dir. Financeiro',
      description: 'Autoriza empenhos com justificativa de estouro, assina autorizações de fornecimento.',
      level: 'diretoria',
      permissions: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'],
      badges: ['Diretoria', 'Aprovação Final'],
      responsavelPadrao: 'Dr. Roberto Silveira (Dir. Administrativo)'
    },
    {
      id: 'auditor_tce_sus',
      name: 'Auditor de Controle Interno / TCE',
      description: 'Acompanha conformidade com Lei 14.133/2021, teto CMED e rastreamento fiscal.',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Auditoria Externa', 'Somente Leitura'],
      responsavelPadrao: 'Dra. Beatriz Fontana (Auditora Chefe)'
    }
  ],

  'estoque-central': [
    {
      id: 'almoxarife_chefe',
      name: 'Almoxarife Chefe / Gestor CD',
      description: 'Controle total do Centro de Distribuição, inventário, balanceamento de estoque e conferência.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT', 'AUDIT'],
      badges: ['Supervisão CD', 'Poder Total'],
      responsavelPadrao: 'Marcos Vinícius Prado (CRF/CD 8832)'
    },
    {
      id: 'auxiliar_recebimento',
      name: 'Conferente de Recebimento',
      description: 'Realiza conferência cega de NF, leitura de código de barras e alocação física de paletes.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE'],
      badges: ['Recebimento Físico', 'Operacional'],
      responsavelPadrao: 'José Nilton da Silva (Almoxarifado CD)'
    },
    {
      id: 'auditor_inventario',
      name: 'Auditor de Inventário e Perdas',
      description: 'Auditoria de perdas, quebras, validade FEFO e divergências de contagem cega.',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Auditoria', 'Compliance'],
      responsavelPadrao: 'Juliana Vasconcelos (Controle de Qualidade)'
    }
  ],

  'escala-medica': [
    {
      id: 'coordenador_escala',
      name: 'Coordenador de Plantões & Especialidades',
      description: 'Cria grades mensais, aloca médicos por setor, resolve furos e autoriza substituições.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['Coordenação Médica', 'Gestão de Grade'],
      responsavelPadrao: 'Dr. Fernando Albuquerque (CRM 142.339)'
    },
    {
      id: 'medico_plantonista',
      name: 'Médico Plantonista',
      description: 'Visualiza seus plantões, realiza check-in/ponto digital e solicita trocas com pares.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE'],
      badges: ['Corpo Clínico', 'Troca de Plantão'],
      responsavelPadrao: 'Dra. Camila Nogueira (CRM 188.420)'
    },
    {
      id: 'diretor_clinico',
      name: 'Diretor Clínico',
      description: 'Homologa a escala do hospital, aprova despesas extraordinárias com plantões e sobreavisos.',
      level: 'diretoria',
      permissions: ['READ', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['Diretoria Clínica', 'Homologação'],
      responsavelPadrao: 'Dr. Eduardo Sampaio (Diretoria Médica)'
    },
    {
      id: 'auditor_rh_frequencia',
      name: 'Auditor de RH & Ponto',
      description: 'Convalida presença biométrica, espelhos de ponto e cálculo do split financeiro de horas.',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['RH Hospitalar', 'Folha / Split'],
      responsavelPadrao: 'Renata Lemos (Gestão de Pessoas)'
    }
  ],

  'farmacia-estoque': [
    {
      id: 'farmaceutico_rt',
      name: 'Farmacêutico Responsável Técnico (RT)',
      description: 'Aprova dispensações de alto custo, assina livro de psicotrópicos (Portaria 344) e recalls.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['RT Anvisa', 'Controle Total'],
      responsavelPadrao: 'Dr. Thiago Medeiros (CRF 44.910)'
    },
    {
      id: 'farmaceutico_clinico',
      name: 'Farmacêutico Clínico',
      description: 'Avalia interações medicamentosas, posologia, aprazamento e compatibilidade beira-leito.',
      level: 'supervisao',
      permissions: ['READ', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['Farmácia Clínica', 'Triagem de Prescrição'],
      responsavelPadrao: 'Dra. Paula Guimarães (CRF 51.204)'
    },
    {
      id: 'dispensador_beira_leito',
      name: 'Técnico / Separador Beira-Leito',
      description: 'Separa kits individualizados por paciente, bipagem de código unitário e saída física.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE'],
      badges: ['Separação e Bipagem', 'Dose Unitária'],
      responsavelPadrao: 'Lucas Andrade (Auxiliar de Farmácia)'
    }
  ],

  'gestao-clinica': [
    {
      id: 'medico_assistente',
      name: 'Médico Assistente',
      description: 'Preenche prontuário eletrônico (PEP), emite prescrições, laudos e altas hospitalares.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['Prescritor', 'CRM Ativo'],
      responsavelPadrao: 'Dr. Lucas Tavares (CRM/SP 177.892)'
    },
    {
      id: 'enfermeiro_chefe',
      name: 'Enfermeiro Chefe de Ala',
      description: 'Realiza evolução de enfermagem, checagem beira-leito, aprazamento e triagem Manchester.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['COREN', 'Liderança de Ala'],
      responsavelPadrao: 'Enf. Mariana Castro (COREN 298.110)'
    },
    {
      id: 'auditor_clinico',
      name: 'Auditor Médico / Qualidade Hospitalar',
      description: 'Audita prontuários para compliance com protocolos (Sepse, AVC), prontuário e elegibilidade SUS.',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Qualidade e Segurança', 'Acreditação ONA'],
      responsavelPadrao: 'Dr. Henrique Alencar (Auditoria Médica)'
    }
  ],

  'laboratorio': [
    {
      id: 'biomedico_rt',
      name: 'Biomédico / Bioquímico RT',
      description: 'Valida calibrações de analisadores, assina laudos finais e notifica valores de pânico.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['RT Laboratório', 'Assinatura Digital'],
      responsavelPadrao: 'Dra. Gabriela Fontes (CRBM 19.420)'
    },
    {
      id: 'tecnico_coleta',
      name: 'Técnico de Coleta e Triagem',
      description: 'Realiza punção, identificação de tubos com código de barras e triagem pré-analítica.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE'],
      badges: ['Pré-Analítico', 'Coleta Beira-Leito'],
      responsavelPadrao: 'Alexandre Souza (Técnico em Patologia)'
    },
    {
      id: 'auditor_laudos',
      name: 'Auditor de Controle de Qualidade LIS',
      description: 'Acompanha gráficos de Levey-Jennings, repetições de controle e tempos TAT (Turnaround Time).',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Controle de Qualidade', 'SBPC/ML'],
      responsavelPadrao: 'Dr. Vinícius Barreto (Controle de Qualidade)'
    }
  ],

  'leitos-censo': [
    {
      id: 'regulador_nir',
      name: 'Regulador do Núcleo Interno (NIR)',
      description: 'Aloca pacientes em leitos de UTI e enfermarias, gerencia transferências e fila de regulação.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
      badges: ['Regulação NIR', 'Alocação de Leitos'],
      responsavelPadrao: 'Dra. Vanessa Meireles (Coordenadora NIR)'
    },
    {
      id: 'supervisor_hotelaria',
      name: 'Supervisor de Higienização e Hotelaria',
      description: 'Recebe chamados de leitos vagos, comanda higienização terminal e libera leito para ocupação.',
      level: 'operacional',
      permissions: ['READ', 'UPDATE', 'APPROVE'],
      badges: ['Giro de Leito', 'Higienização Terminal'],
      responsavelPadrao: 'Cláudia Regina (Supervisora de Hotelaria)'
    },
    {
      id: 'gestor_assistencial',
      name: 'Gerente Assistencial / Diretoria',
      description: 'Monitora taxa de ocupação, tempo médio de permanência (TMP) e indicadores hospitalares.',
      level: 'diretoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Gestão de Capacidade', 'Diretoria'],
      responsavelPadrao: 'Dr. Valter Silveira (Diretoria Assistencial)'
    }
  ],

  'financeiro-split': [
    {
      id: 'faturista_sus',
      name: 'Faturista SUS / Convênios',
      description: 'Gera remessas de BPA (Ambulatorial) e AIH (Internação), valida códigos da tabela SIGTAP.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE', 'EXPORT'],
      badges: ['Faturamento SUS', 'SIGTAP / BPA / AIH'],
      responsavelPadrao: 'Sandra Regina Ramos (Faturista Sênior)'
    },
    {
      id: 'auditor_glosas',
      name: 'Auditor de Contas e Glosas',
      description: 'Identifica glosas de operadoras e SUS, elabora defesas e recursos recursais para recebimento.',
      level: 'supervisao',
      permissions: ['READ', 'UPDATE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['Recurso de Glosas', 'Auditoria Financeira'],
      responsavelPadrao: 'Marcelo Pires (Auditoria de Contas)'
    },
    {
      id: 'controller_financeiro',
      name: 'Controller / Diretor Financeiro',
      description: 'Aprova repasses de split a médicos, acompanha conciliação bancária e fluxo de caixa.',
      level: 'diretoria',
      permissions: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'AUDIT'],
      badges: ['Diretoria Financeira', 'Split & Repasse'],
      responsavelPadrao: 'Otávio Mendonça (CFO / Diretor Financeiro)'
    }
  ],

  'automacao-mensageria': [
    {
      id: 'operador_comunicacao',
      name: 'Operador de Mensageria & SAC',
      description: 'Dispara notificações manuais a familiares, responde chamados de dúvidas e confirma agendamentos.',
      level: 'operacional',
      permissions: ['READ', 'CREATE', 'UPDATE'],
      badges: ['Atendimento Humanizado', 'WhatsApp / SMS'],
      responsavelPadrao: 'Bruna Takahashi (Atendimento ao Cidadão)'
    },
    {
      id: 'admin_disparos',
      name: 'Administrador de Gatilhos e Bots',
      description: 'Configura fluxos do EvolutionAPI / Typebot, templates de mensagem aprovados e conexão QR Code.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['Infra Mensageria', 'Configuração de Bots'],
      responsavelPadrao: 'Gabriel Siqueira (Especialista em Automação)'
    }
  ],

  'ingestao-modulos': [
    {
      id: 'engenheiro_dados',
      name: 'Engenheiro de Dados em Saúde',
      description: 'Mantém pipelines ETL, conectores HL7/FHIR, processa tabelas SIGTAP e monitora dead letter queues.',
      level: 'supervisao',
      permissions: ['READ', 'CREATE', 'UPDATE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['Interoperabilidade', 'HL7 FHIR / ETL'],
      responsavelPadrao: 'Rodrigo Brandão (Eng. Dados Hospitalar)'
    },
    {
      id: 'dba_suporte',
      name: 'Administrador de Banco e Conexões',
      description: 'Supervisiona latência de replicação, backups de dados clínicos e integridade referencial.',
      level: 'operacional',
      permissions: ['READ', 'UPDATE', 'AUDIT'],
      badges: ['Infraestrutura DBA', 'Monitoramento'],
      responsavelPadrao: 'Danilo Pacheco (DBA & SRE)'
    }
  ],

  'arquitetura-seguranca': [
    {
      id: 'ciso_seguranca',
      name: 'Chief Information Security Officer (CISO)',
      description: 'Define políticas de privilégio mínimo, investiga incidentes de intrusão e gerencia certificados.',
      level: 'diretoria',
      permissions: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'AUDIT', 'EXPORT'],
      badges: ['CISO', 'Autoridade Máxima de Segurança'],
      responsavelPadrao: 'Leonardo Bittencourt (CISSP / CISO)'
    },
    {
      id: 'dpo_lgpd',
      name: 'Encarregado de Proteção de Dados (DPO)',
      description: 'Audita rastreabilidade de acesso a prontuários e receitas conforme art. 11 da LGPD para dados sensíveis.',
      level: 'auditoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['DPO LGPD', 'Proteção de Dados Sensíveis'],
      responsavelPadrao: 'Dra. Patrícia Fontoura (DPO Certificada)'
    }
  ],

  'dashboard-executivo': [
    {
      id: 'ceo_diretor_geral',
      name: 'Diretor Geral / CEO Hospitalar',
      description: 'Visão holística de 360° com desfechos clínicos, tempo de espera, orçamento executado e taxa de ocupação.',
      level: 'diretoria',
      permissions: ['READ', 'AUDIT', 'EXPORT'],
      badges: ['Diretoria Geral', 'Conselho Gestor'],
      responsavelPadrao: 'Dr. Arthur Drummond (Superintendente Executivo)'
    },
    {
      id: 'secretario_saude',
      name: 'Secretário Municipal / Fiscalizador SUS',
      description: 'Acompanhamento do contrato de gestão pública, metas atingidas, filas de cirurgias e conformidade.',
      level: 'auditoria',
      permissions: ['READ', 'EXPORT'],
      badges: ['Gestão Pública', 'Transparência SUS'],
      responsavelPadrao: 'Secretaria de Saúde / Gabinete Municipal'
    }
  ]
};

export function getRolesForModulo(moduloId: ModuloId): ModuloRole[] {
  return MODULO_ROLES_CATALOG[moduloId] || [];
}

export function hasPermission(role: ModuloRole, action: PermissionAction): boolean {
  return role.permissions.includes(action);
}
