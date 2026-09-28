# Módulo 03 — Leitos, Internação & NIR (Núcleo Interno de Regulação)

## Visão Geral
O módulo `03-modulo-leitos-internacao/` é a central de comando operacional do hospital. Gerencia o censo diário, tempo de permanência (*Length of Stay* - LOS), leitos de UTI/Enfermaria/Isolamento e alocação de pacientes via Kanban do NIR.

## Estados do Leito
- `LIVRE`: Disponível para internação imediata.
- `OCUPADO`: Paciente admitido em tratamento.
- `HIGIENIZACAO`: Solicitada limpeza profunda de alta eficiência ao módulo `09-modulo-facilities-hotelaria/`.
- `MANUTENCAO`: Bloqueado para reparo de infraestrutura.
- `ISOLAMENTO`: Alocado para doenças infectocontagiosas.

## Execução Local
```bash
docker-compose up -d
```
