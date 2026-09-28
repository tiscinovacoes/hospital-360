# ADR-001: Arquitetura Modular Multi-Repo & Barramento de Eventos Assíncronos

## Status
Aceito (Accepted)

## Data
2026-09-28

## Contexto
O ecossistema **Hospital 360** é composto pelo Núcleo Central de Custeio e 16 módulos especializados (OpenEMR, SENAITE LIMS, Bahmni, OpenBoxes, Hyperswitch, ERPNext, etc.) escritos em diversas linguagens (PHP, Python, Java, Rust, Node.js, C#).

Necessitávamos decidir entre:
1. Reescrever todos os módulos em uma única linguagem (Monólito/Monorepo).
2. Manter uma arquitetura de microsserviços poliglotas isolados em contêineres Docker, comunicando via APIs REST e barramento de eventos (n8n).

## Decisão
Adotar a **Arquitetura Modular Multi-Repo com Comunicação Desacoplada**:
- Cada módulo habita seu próprio repositório/pasta isolada com `Dockerfile` e contrato OpenAPI próprio.
- O Hub `00-hub-core` consome dados via APIs REST e escuta o barramento de eventos assíncrono (n8n).
- A comunicação entre módulos irmãs de mesmo domínio (ex: Estoque, Farmácia FEFO e Compras) tem acesso direto ao banco ou sincronização em tempo real autorizada para performance.

## Alternativas Consideradas

### Reescrita Total em TypeScript/Node.js
- **Pros:** Stack única para a equipe.
- **Cons:** Levaria de 18 a 36 meses, destruindo o time-to-market e reintroduzindo bugs em motores consagrados (OpenEMR, SENAITE).
- **Rejeitado:** Custo de oportunidade e risco inaceitáveis.

## Consequências
- Independência total de deploy por squad.
- Possibilidade de venda fracionada de módulos avulsos para clientes com ERPs legados.
- Exige governança rigorosa de contratos de API (OpenAPI) e idempotência no n8n.
