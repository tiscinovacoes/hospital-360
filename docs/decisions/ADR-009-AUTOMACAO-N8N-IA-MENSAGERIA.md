# ADR 009: Módulo de Automação n8n, IA Diagnóstica Auxiliar & Mensageria WhatsApp Omnichannel

## Contexto
O ecossistema **Hospital 360** necessita de orquestração de processos entre os 15 módulos via fluxos n8n, suporte à decisão clínica baseada em IA e engajamento do paciente via WhatsApp API.

## Decisão de Arquitetura

### 1. Despachante Central de Eventos n8n
- O endpoint `/api/automacao/n8n-dispatch` atua como barramento de mensageria centralizado, roteando eventos para os webhooks cadastrados no n8n.

### 2. Agente Auxiliar de IA Diagnóstica
- Analisa sintomas relatados e sinais vitais em `/api/ia/diagnostico-auxiliar`, retornando nível de prioridade (Manchester/CFM) e exames sugeridos com aviso legal obrigatório de responsabilidade médica.

### 3. Mensageria WhatsApp Omnichannel
- Envio de laudos, confirmações de consulta e pesquisas NPS em `/api/mensageria/whatsapp` via Meta Cloud API / Baileys.

## Consequências
- **Comunicação Ativa**: Paciente informado em tempo real sobre exames, consultas e recomendações.
- **Eficiência Clínica**: Triagem inteligente que agiliza a conduta em casos de dor torácica ou suspeita de sepse.
