# ADR-002: Isolamento Multi-Tenant com Row Level Security (RLS) e Norma RN-IND

## Status
Aceito (Accepted)

## Data
2026-09-28

## Contexto
O condomínio hospitalar abriga clínicas médicas independentes que compartilham a infraestrutura predial e áreas comuns. Por norma regulatória médica (RN-IND) e LGPD, a gestão do condomínio **NÃO pode ter acesso a prontuários, evoluções clínicas ou diagnósticos dos pacientes** atendidos nos consultórios parceiros.

## Decisão
Implementar **Row Level Security (RLS)** diretamente no banco de dados PostgreSQL / Supabase:
- Toda tabela sensível (`ingestao_eventos`, `jornada_doortodoor`, `pacientes`) possui a coluna `tenant_id`.
- Políticas RLS aplicam a verificação estrita: `tenant_id = public.get_current_tenant_id()`.
- O perfil `CONDOMINIO_ADMIN` visualiza apenas agregados financeiros para cobrança de taxa de condomínio e rateio, sem acesso aos registros de anamnese.

## Consequências
- Conformidade total com LGPD, CFM e RN-IND (*Privacy by Design*).
- Impossibilidade de vazamento de dados mesmo em caso de falha na camada de aplicação, pois a trava está no motor do banco de dados.
