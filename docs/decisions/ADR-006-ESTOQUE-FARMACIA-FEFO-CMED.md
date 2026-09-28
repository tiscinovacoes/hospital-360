# ADR 006: Módulo de Estoque, Farmácia FEFO, Intralogística WMS e Validação Governamental CMED / BPS / CATMAT

## Contexto
A gestão de suprimentos e farmácia hospitalar do **Hospital 360** envolve quatro pilares interligados:
1. `04-modulo-estoque-farmacia/`: OpenBoxes (Java/Grails) para controle de farmácia hospitalar.
2. `05-modulo-wms-intralogistica/`: Orquestração de separação (*Pick & Pack*) e transporte.
3. `06-modulo-compras-suprimentos/`: ERPNext (Python/Frappe) para cotações e compras.
4. `15-modulo-base-precos-cmed/`: Microserviço validador de preços públicos de medicamentos frente às tabelas oficiais da ANVISA/CMED, BPS e CATMAT.

## Decisão de Arquitetura

### 1. Algoritmo FEFO (*First Expired, First Out*)
- A reserva de estoque para atendimento a prescrições médicas (`openemr.prescricao_emitida`) obrigatoriamente aloca primeiro os lotes com a **menor data de validade** restante (`data_vencimento` mais próxima do dia atual).
- Lotes vencidos ou em quarentena são sumariamente descartados da lista de alocação.

### 2. Microserviço Validador CMED / BPS / CATMAT
- Toda ordem de compra no ERPNext passa pela trava `/api/cmed/validar`.
- **Status ILLEGAL**: Ocorre se o preço fornecido exceder o teto máximo permitido pela ANVISA/CMED. A ordem de compra é **bloqueada imediatamente**.
- **Status WARNING**: Ocorre se o preço for superior à média praticada no SUS (BPS), mas abaixo do teto CMED. Gera alerta de negociação.
- **Status OK**: Preço dentro da conformidade legal.

### 3. Alertas de Ruptura & Cadeia de Frio
- Geladeiras e câmaras frias de vacinas e imunobiológicos enviam telemetria IoT via `/api/openboxes/alerta-temperatura-estoque`.
- Variações fora do intervalo regulatório (2°C a 8°C) geram alerta crítico imediato para remanejamento de acervo.

### 4. Apuração de Custos no Hub Core
- Na dispensação do insumo ao leito, o evento `openboxes.farmacia_dispensado` reporta à **Estação 3 (Insumos e Medicamento do Paciente)** do `00-hub-core/` o valor exato de aquisição do lote consumido.

## Consequências

### Positivas
- **Redução do Desperdício**: A regra FEFO impede o vencimento acidental de insumos caros em prateleira.
- **Compliance e Anticorrupção**: Bloqueio automático de compras acima do teto regulatório da ANVISA/CMED.
- **Transparência de Custos**: O prontuário do paciente contabiliza exatamente o custo real de cada ampola ou comprimido administrado.

### Riscos / Mitigações
- **Pico de Dispensações no Prontos-Socorro**: Testado via suíte de integração e estresse `k6-load-testing`. Operação assíncrona garante resiliência do barramento.
