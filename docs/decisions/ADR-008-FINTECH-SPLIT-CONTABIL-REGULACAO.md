# ADR 008: Módulo Fintech, Split de Pagamentos, Contabilidade Fiscal NFSe e Regulação TFD

## Contexto
O modelo de receita do **Hospital 360** requer o fracionamento instantâneo das liquidações de atendimento em múltiplos recebedores (hospital, médico e laboratório), a automação da emissão de notas fiscais (NFSe) e a regulação de viagens intermunicipais para o Tratamento Fora do Domicílio (TFD).

## Decisão de Arquitetura

### 1. Split Engine Criptografado & Automatizado
- O motor `/api/fintech/split` valida rigorosamente se a soma das frações atinge exatamente 100%.
- Repasse executado diretamente no ato da captura da transação no gateway adquirente.

### 2. Emissão Fiscal & Cálculo de Tributos
- Cálculo automatizado de ISS (2% a 5%), PIS (0.65%), COFINS (3.00%) e IRRF (1.50%) em `/api/contabilidade/nota-fiscal`.
- Assinatura digital XML e emissão do espelho PDF da NFSe.

### 3. Regulação & TFD (SUS / ANS)
- O módulo `/api/regulacao/tfd` valida elegibilidade e emite voucher automatizado para auxílio de transporte e acompanhante em procedimentos de alta complexidade.

## Consequências
- **Inadimplência Zero de Honorários**: O médico e o laboratório recebem sua parcela diretamente via split, eliminates a necessidade de cobrança posterior.
- **Conformidade Fiscal**: Registro e recolhimento correto de impostos municipais e federais.
