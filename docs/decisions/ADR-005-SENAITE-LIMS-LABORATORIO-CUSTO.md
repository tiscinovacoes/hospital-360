# ADR 005: Módulo de Laboratório SENAITE LIMS, Etiquetas Barcode e Apuração de Custos por Exame

## Contexto
O ecossistema **Hospital 360** necessita de integração nativa com o **SENAITE LIMS** (Laboratório de Análises Clínicas e Patologia), operando no diretório `02-modulo-laboratorio/`. O módulo precisa catalogar exames (padrão LOINC), receber Ordens de Serviço (WorkOrders) vindas da Triagem/Atendimento (Squad 2 - OpenEMR), gerar etiquetas com Código de Barras ZPL/QR Code SVG para tubos de ensaio, calcular o custo real de produção laboratorial e emitir laudos médicos com assinatura digital simulada ICP-Brasil/PKCS#7.

## Decisão de Arquitetura

### 1. Separação de Responsabilidade & Stack Docker SENAITE
- **Stack LIMS**: SENAITE 2.x rodando sobre Plone 5.2/Zope com banco relacional PostgreSQL 15 e ZODB para persistência de amostras.
- **Isolamento de Tenant**: Todo payload e rastro laboratorial carrega a chave `tenant_id` cumprindo a norma **RN-IND**.

### 2. Motor de Custo Laboratorial em Alta Precisão (`Decimal`)
Para evitar erros de ponto flutuante no cálculo contábil e financeiro do custo unitário por exame, implementou-se a fórmula matemática:
$$\text{Custo Real Exame} = \text{Reagentes (R\$)} + \text{Descartáveis (R\$)} + \left( \frac{\text{Tempo Bancada Minutos}}{60} \times \text{R\$ 60,00/h} \right)$$
Onde:
- `Reagentes`: Custo fracionado do kit analítico utilizado.
- `Descartáveis`: Custo de agulha, tubo a vácuo, luvas e ponteiras.
- `Tempo Bancada`: Minutos de trabalho técnico especializado computados a uma taxa horária ajustável.

### 3. Emissão de Laudos PDF & Assinatura Digital ICP-Brasil
- **Laudo Médico**: Gerado em padrão executivo contendo parâmetros LOINC, valores de referência laboratoriais e flag de alteração (`Normal`, `Critico_Alto`, `Critico_Baixo`).
- **Segurança PKCS#7**: Simulação de envelope criptográfico SHA256withRSA com carimbo de tempo (Timestamp Authority) do patologista/biomédico responsável.

### 4. Barramento de Eventos (`senaite.exame_concluido`)
Ao concluir e assinar o laudo, o sistema dispara o evento `senaite.exame_concluido` assincronamente para:
1. O **Barramento n8n** (`/api/webhooks/n8n`).
2. O **Módulo Clínicas (Squad 2)** via `/api/openemr/retorno-exame` para disponibilização imediata ao médico solicitante.
3. O **Hub Core (Squad 1)** via `HubDespesasService` na Estação 2 (Apoio Diagnóstico) para inclusão do custo real da amostra no censo diário do hospital.

## Consequências

### Positivas
- **Rastreabilidade Total**: Etiquetas ZPL/QR Code garantem que nenhum tubo de ensaio perca a vinculação com o paciente ou WorkOrder.
- **Precisão Financeira**: Custos laboratoriais são apurados em tempo real por amostra processada, alimentando o DRE do hospital.
- **Conformidade Legal**: Laudos PDF possuem carimbo de assinatura digital e identificadores LOINC padronizados.

### Riscos / Mitigações
- **Carga em Exames em Lote**: Testado via suíte de integração e estresse `k6-load-testing`. Processamento assíncrono por bancada garante resiliência na recepção de grandes volumes de WorkOrders.
