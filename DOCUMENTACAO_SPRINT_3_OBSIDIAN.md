---
projeto: Hospital 360
sprint: 3
data: 2026-09-21
status: Concluído
tags:
  - sprint-3
  - lims-senaite
  - hyperswitch-rust
  - healvista-dotnet
  - n8n-workflow
  - seguranca-rn-ind
  - door-to-door
aliases:
  - Sprint 3 - Diagnóstico, Split e Contábil
---

# Hospital 360 — Especificação da Sprint 3: Diagnóstico LIMS, Split Financeiro & Faturamento Contábil

> [!info] Visão Executiva da Sprint 3
> A Sprint 3 fecha a esteira assistencial especializada: conexão do consultório médico ao **SENAITE LIMS** via Python 3.12, liquidação multi-gateway de honorários com split 85/15 no **Hyperswitch (Rust)**, emissão e escrituração automática de NFS-e no **HealVista (.NET 8)** e notificações em tempo real ao paciente via **WhatsApp Poli CRM**.

---

## 1. Mapeamento de Squads & Tecnologias

| Squad | Colaborador(a) | Tecnologia | Escopo de Entrega | Referência |
| :--- | :--- | :--- | :--- | :--- |
| **Squad 3** | **Felipe Vasconcelos** | Python 3.12 / Pydantic V2 | Conector SENAITE LIMS, etiquetas com código de barras, catálogo de exames e laudo assinado. | `[[lims_senaite_connector]]` |
| **Squad 6** | **André Castilho** | Rust 1.75 / Tokio / C# .NET | Motor de Split 85/15 no Hyperswitch e emissão de NFS-e no HealVista Contábil. | `[[hyperswitch_split_engine]]` |
| **Squad 7** | **Camila Medeiros** | n8n / Baileys WhatsApp | Barramento de eventos, DLQ e disparos de confirmação de agenda e link de laudo no WhatsApp. | `[[workflow_barramento_hospital360]]` |
| **Squad 1** | **Gabriel Martins** | Next.js 16 / Supabase | Cockpit C-Level e consolidação do custo Door-to-Door das 4 estações. | `[[ARCHITECTURE]]` |

---

## 2. Padrões Arquiteturais & Contratos

### 2.1 Conector Laboratorial SENAITE LIMS (Python 3.12)
> [!tip] Rastreabilidade por Amostra
> Cada WorkOrder laboratorial gera um código de barras exclusivo no padrão LOINC (`SAMPLE-LOINC-*`), permitindo a bipagem do tubo de ensaio nas bancadas de análise clínica.

- **Exames Catalogados**:
  - `LOINC-6598-7`: Troponina I Cardíaca Ultrassensível (Custo: R$ 60,00 | Prazo: 30 min)
  - `LOINC-1751-7`: Hemograma Completo com Plaquetas (Custo: R$ 32,50 | Prazo: 45 min)
  - `LOINC-1988-5`: PCR Quantitativa (Custo: R$ 23,20 | Prazo: 30 min)
  - `LOINC-2093-3`: Lipidograma Completo (Custo: R$ 31,80 | Prazo: 60 min)

### 2.2 Motor de Split Financeiro Hyperswitch (Rust 1.75)
> [!success] Precisão Monetária Absoluta
> Implementado com aritmética de ponto fixo em centavos inteiros (`u64`), eliminando desvios de arredondamento de ponto flutuante em grandes volumes de transações.

$$\text{Valor Total} = \text{Repasse Clínica (85\%)} + \text{Taxa Condomínio Hospitalar (15\%)}$$

### 2.3 Escrituração Contábil & NFS-e Municipal (.NET 8)
- **Prestador**: Condomínio e Gestão Hospitalar 360 SPE Ltda. (CNPJ: `44.921.840/0001-92`).
- **Tributação**: Alíquota ISS 5% retida na fonte sobre a taxa de condomínio.
- **Partidas Dobradas no Livro Diário**:
  - *Débito*: `1.1.1.05 - Banco do Brasil / PIX Liquidado D+0`
  - *Crédito*: `3.1.1.02 - Receita Operacional Condomínio Hospitalar`

---

## 3. Segurança & Regulatória RN-IND

> [!security] Blindagem de Prontuário Médico (Zero-Trust)
> Conforme a diretriz regulatória **RN-IND**, o condomínio hospitalar e os relatórios fiscais **não têm acesso** a diagnósticos médicos (CID-10), anamnese ou prescrições clínicas do consultório. Apenas o valor financeiro consolidado e a taxa de rateio de área comum transitam para o ERP contábil.

---

## 4. Próximos Passos (Transição para Sprint 4)

- [ ] Consolidação da jornada Door-to-Door completa (Estação 1 a 5).
- [ ] Homologação do piloto hospitalar com treinamento de equipes de recepção e faturamento.
- [ ] Ativação do gerador de relatórios para clientes sem módulos contratados (`/ingestao-modulos`).

---
*Documento homologado pela liderança técnica.*  
*Links úteis:* `[[HANDOFF_LIDER_TECNICO_SQUADS]]` • `[[ARQUITETURA_SISTEMA_360_MODULAR]]` • `[[PROTOCOLO-AGENTES]]`
