# Módulo 09 — Facilities & Hotelaria Hospitalar

## Visão Geral
O módulo `09-modulo-facilities-hotelaria/` gerencia a infraestrutura hospitalar, higienização de alta eficiência beira-leito, governança de enxoval e manutenção preventiva/corretiva de equipamentos.

## Fluxo de Higienização de Leito
1. Recebe gatilho de leito desocupado (`HIGIENIZACAO`) do NIR.
2. Aloca equipe de limpeza e dispara cronômetro de giro de leito (*Turnaround Time*).
3. Ao finalizar a desinfecção, libera o leito (`LIVRE`) no censo hospitalar.
