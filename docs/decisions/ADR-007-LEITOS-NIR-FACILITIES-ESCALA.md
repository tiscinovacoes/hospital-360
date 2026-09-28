# ADR 007: Módulo de Leitos, Censo Hospitalar NIR, Facilities & Rateio de Escala Médica

## Contexto
O funcionamento do hospital demanda sintonia entre o Núcleo Interno de Regulação (NIR), a desinfecção beira-leito (Facilities) e o rateio financeiro de diárias e plantões médicos.

## Decisão de Arquitetura

### 1. Estados do Leito no Censo NIR
- **`LIVRE`**: Disponível para internação imediata.
- **`OCUPADO`**: Admitido com imputação automática da diária hospitalar.
- **`HIGIENIZACAO`**: Ao dar alta ao paciente, o leito passa para higienização e abre ordem de serviço no módulo `09-modulo-facilities-hotelaria/`.
- **`MANUTENCAO`**: Bloqueado para reparo de engenharia clínica.

### 2. Rateio de Honorário Médico por Paciente-Dia
- O valor contratual do plantão do médico intensivista/plantonista é rateado proporcionalmente entre os pacientes internados no setor durante aquele plantão.
- Imputação realizada na **Estação 5 (Hotelaria, Diárias & Honorários Médicos)** do `00-hub-core/`.

## Consequências
- **Giro de Leito Otimizado**: Cronometragem precisa do *Turnaround Time* entre alta e liberação para novo paciente.
- **Custo Real de Diária e Honorário**: O prontuário do paciente reflete o rateio exato do corpo médico e da diária do leito.
