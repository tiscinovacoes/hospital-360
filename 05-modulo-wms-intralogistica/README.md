# Módulo 05 — WMS & Intralogística Hospitalar

## Visão Geral
O módulo `05-modulo-wms-intralogistica/` gerencia o encaminhamento físico de medicamentos e insumos do estoque central (*Pick & Pack*) para as farmácias satélites, postos de enfermagem e leitos de internação.

## Fluxo de Trabalho
1. Recebe ordem de separação da farmácia FEFO (`04-modulo-estoque-farmacia/`).
2. Atribui tarefa de transporte ao profissional/maqueiro logístico ou sistema de correio pneumático/AGV.
3. Notificação de confirmação de entrega no destino final.
