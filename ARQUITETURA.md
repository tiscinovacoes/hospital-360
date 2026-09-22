# AIVO — Arquitetura do Sistema

## 1. Visão Geral

AIVO é um sistema web de gestão integrada de saúde pública voltado para municípios do estado do Mato Grosso do Sul. Centraliza o fluxo de regulação, agendamento, atendimento médico, recepção, tratamento fora de domicílio (TFD) e auditoria, interligando os diferentes atores da rede de saúde municipal.

**Stack:** React 18 · TypeScript · Tailwind CSS · Vite · Lucide React · Recharts

---

## 2. Perfis de Acesso

O sistema possui **6 perfis** selecionáveis no Hub de Perfis (tela inicial). Cada perfil tem seu próprio sidebar de navegação e conjunto de telas.

| Perfil | ID interno | Cor | Função |
|---|---|---|---|
| Gestor / Regulação | `gestor` | Azul | Administração geral, filas, relatórios |
| Portal do Médico | `medico` | Ciano | Agenda e prontuário eletrônico |
| Recepção UBS | `recep-ubs` | Violeta | Check-in de pacientes na unidade básica |
| Recepção Regulação | `recep-reg` | Fúcsia | Agendamentos e status de confirmações |
| Central de Regulação | `regulador` | Âmbar | Vagas e guias de autorização |
| Agente TFD | `tfd` | Verde | Viagens, frota e roteirização |

---

## 3. Mapa de Telas por Perfil

### 3.1 Gestor / Regulação
```
dashboard          → Painel geral (KPIs, gráficos, confirmações)
upload             → Upload de listas de pacientes
queue              → Filas por especialidade + disparo WhatsApp
specialty-detail   → Detalhe da fila de uma especialidade
patients           → Lista geral de pacientes
patient-detail     → Ficha completa do paciente (histórico, LGPD)
clinics            → Clínicas terceirizadas credenciadas
clinic-detail      → Painel da clínica (produção, agendamentos)
reports            → Relatórios de confirmações e produção
audit              → Logs de auditoria do sistema
chatbot            → Configuração do bot de WhatsApp
whatsapp           → Conexão e status do WhatsApp Business
```

### 3.2 Portal do Médico
```
doctor-agenda      → Agenda do dia (fila da recepção, status de presença)
doctor-record      → Prontuário eletrônico (evolução, guias, prescrição, assinatura)
```

### 3.3 Recepção UBS
```
ubs-dashboard      → Dashboard da fila da UBS
ubs-agenda         → Agenda do dia com check-in de pacientes
ubs-cadastro       → Cadastro de paciente com ênfase no Cartão SUS (CNS)
```

### 3.4 Recepção Regulação
```
reg-dashboard      → Dashboard com todas as filas do dia
reg-agenda         → Agenda geral de agendamentos (todos os médicos)
reg-cadastro       → Cadastro de paciente
reg-agendamento    → Novo agendamento de paciente
reg-whatsapp       → Status das respostas de confirmação via WhatsApp
```

### 3.5 Central de Regulação
```
regulador-vagas    → Painel de vagas por especialidade (municipal/estadual)
regulador-guias    → Gestão de guias de autorização (tabela + detalhe lateral)
```

### 3.6 Agente TFD
```
tfd-viagens        → Lista e aprovação de viagens (saída sempre de Ponta Porã)
tfd-frota          → Controle de frota (vans, micro-ônibus, ambulâncias)
tfd-roteirizacao   → Roteiro de passageiros por data de viagem
```

---

## 4. Arquitetura Técnica

### 4.1 Estrutura de Arquivos
```
src/
├── app/
│   ├── App.tsx            → Componente raiz, roteamento, sidebars, hub
│   ├── shared.tsx         → Tipos, dados e componentes compartilhados
│   └── GestorScreens.tsx  → Telas do perfil Gestor (módulo separado)
├── styles/
│   ├── fonts.css          → Import Google Fonts (Inter, DM Mono)
│   ├── theme.css          → Tokens de design (CSS custom properties)
│   └── index.css          → Base Tailwind + mapeamento de tokens
```

### 4.2 Roteamento (State-based SPA)
Não há react-router. A navegação é controlada por estado local:

```typescript
const [showHub, setShowHub]   = useState(true);
const [profile, setProfile]   = useState<AppProfile>("gestor");
const [screen, setScreen]     = useState<Screen>("dashboard");

// Fluxo:
// 1. App inicia com showHub=true → renderiza HubScreen
// 2. Usuário seleciona perfil → showHub=false, profile=<selecionado>
// 3. Navegação dentro do perfil → setScreen(novaScreen)
// 4. Botão "Hub de Perfis" em qualquer sidebar → showHub=true
```

### 4.3 Estado Compartilhado entre Perfis

```
_sharedAgenda: RecepPatient[]   (nível de módulo)
  ├── Recepção UBS atualiza status ao fazer check-in
  └── Médico lê status para ver quem já chegou
```

O `_sharedAgenda` é uma constante de módulo (não estado React) inicializada com os dados de `DOCTOR_AGENDA`. A Recepção UBS faz check-in dos pacientes, alterando o status de `"aguardando"` para `"presente"`.

---

## 5. Modelo de Tipos

### 5.1 Tipos Fundamentais

```typescript
type AppProfile   = "gestor" | "medico" | "recep-ubs" | "recep-reg" | "regulador" | "tfd";
type Priority     = "normal" | "preferential" | "priority1" | "critical";
type PatientStatus= "waiting" | "sent" | "confirmed" | "refused" | "failed" | "expired" | "cancelled";
type ConsultaStatus = "aguardando" | "presente" | "em_atendimento" | "concluido" | "ausente";
type CheckinStatus= "pending" | "present" | "absent";
```

### 5.2 Entidades Principais

| Entidade | Contexto | Campos-chave |
|---|---|---|
| `Patient` | Gestor/WhatsApp | cpf, cns, status, priority, phone |
| `ConsultaPatient` | Médico | checkinCode ("1234"), status, allergies |
| `RecepPatient` | Recepção UBS | extends ConsultaPatient + checkinTime, queuePosition |
| `GuiaReg` | Regulação | status (pendente/aprovado/agendado/cancelado), urgencia |
| `ViagemTFD` | TFD | municipioOrigem (sempre "Ponta Porã"), status |
| `VeiculoFrota` | TFD | tipo, capacidade, alocados, motorista |
| `Clinic` | Gestor | cnpj, specialties, city |

### 5.3 Código de Validação Médica
Todos os pacientes têm `checkinCode: "1234"`. O médico digita este código no prontuário para iniciar o atendimento (validação de presença).

---

## 6. Fluxo de Atendimento (Fluxo Principal)

```
1. [Regulação] Importa lista de pacientes via Upload
2. [WhatsApp Bot] Dispara confirmações automaticamente
3. [Paciente] Confirma via WhatsApp (status: confirmed)
4. [Recepção UBS] No dia: abre Agenda, clica "Paciente Chegou"
      → status do paciente muda para "presente"
      → posição na fila é atribuída (queuePosition)
5. [Médico] Abre Agenda do Dia, vê lista com status atualizado
      → Clica "Iniciar Atendimento" → digita código "1234"
      → Abre Prontuário Eletrônico
6. [Médico] Preenche evolução, emite guias, prescreve medicamentos
      → Finaliza consulta → próximo paciente é chamado
```

---

## 7. Integrações Externas (Mockadas no Protótipo)

| Sistema | Uso | Status |
|---|---|---|
| **WhatsApp Business API** | Envio de confirmações, recebimento de respostas | Mock |
| **CADSUS / CNS** | Busca de paciente pelo Cartão Nacional de Saúde | Mock |
| **RNDS** | Rede Nacional de Dados em Saúde | Mock |
| **REMISSUS** | Sistema estadual de regulação do MS | Mock |
| **SUS / SIGTAP** | Tabela de procedimentos do SUS | Mock |

---

## 8. Design System

### 8.1 Tokens CSS (theme.css)
```css
--background, --foreground  → Cores base da página
--sidebar                   → Fundo dos sidebars (#0B1F35 navy escuro)
--sidebar-accent            → Item ativo no sidebar
--primary                   → Azul principal (#4A9EE8)
--border, --muted           → Bordas e texto secundário
```

### 8.2 Tipografia
- **Inter** — texto geral, labels, títulos
- **DM Mono** — dados numéricos (CPF, CNS, CRM, horários)

### 8.3 Ícones
Lucide React (tree-shakeable, importação por nome).

### 8.4 Gráficos
Recharts — LineChart (tendência semanal), BarChart (produção por clínica).

---

## 9. Regras de Negócio Importantes

- **Código de check-in do médico:** sempre `1234` para todos os pacientes (protótipo)
- **Origem TFD:** sempre "Ponta Porã" em todas as viagens
- **Recepção UBS** não tem acesso a agendamentos nem status de WhatsApp (apenas check-in e cadastro)
- **Recepção Regulação** não faz check-in presencial (não acessa fila UBS)
- **Regulação** gerencia vagas municipais e estaduais por especialidade
- **Guias** têm urgência (normal/urgente/crítico) e status (pendente/aprovado/agendado/cancelado)
- **Cadastro de paciente** começa obrigatoriamente pelo CNS — os dados são puxados do CADSUS

---

## 10. Considerações de Escalabilidade

O protótipo atual é um SPA monolítico com roteamento por estado. Para produção, recomenda-se:

1. **Autenticação:** JWT com refresh tokens, RBAC por perfil
2. **Roteamento:** React Router com rotas protegidas por perfil
3. **Estado global:** Zustand ou React Query para dados do servidor
4. **API:** REST ou GraphQL + WebSocket para atualizações em tempo real
5. **Multi-tenancy:** cada município como tenant isolado
6. **LGPD:** criptografia de campos sensíveis (CPF, CNS, prontuários)
