# ADR-003: Motor de Custeio Real Door-to-Door & Benchmarks SIGTAP / TUSS / CMED

## Status
Aceito (Accepted)

## Data
2026-09-28

## Contexto
A gestão de saúde pública e privada sofre com a falta de visão sobre o **custo acumulado real do paciente** durante sua permanência hospitalar, resultando em glosas não identificadas e estouro de orçamento no SUS.

## Decisão
Criar o **Motor de Custeio Door-to-Door 360°**:
- Estruturar a jornada em 5 Estações Clínicas (Triagem -> Consultório -> LIMS -> Farmácia FEFO -> Hotelaria/Split).
- Acumular o custo direto e indireto em tempo real através da fórmula:
  $$\text{Custo Real} = \text{Mão de Obra} + \text{Insumos FEFO} + \text{Exames} + \text{Diária/Facilities}$$
- Fazer o confronto em tempo de execução contra a Tabela SIGTAP (SUS), Tabela TUSS e Teto CMED.

## Consequências
- Exibição de Margem EBITDA real por procedimento e clínica parceira no Cockpit C-Level.
- Alerta em tempo real de estouro do teto SUS ou sobrepreço CMED.
