# Arquitetura & Segurança - Hospital 360

## Visão Geral

O Hospital 360 é um ecossistema integrado de gestão hospitalar que combina **autonomia financeira** para clínicas proprietárias com **interoperabilidade total** entre sistemas, tudo protegido por **segurança multicamadas**.

---

## 🔒 RN-IND: Autonomia de Faturamento

### Conceito

Cada médico proprietário possui banco de dados financeiro completamente isolado. O administrador do prédio monitora apenas métricas operacionais (volume de pacientes, ocupação), mas **nunca** tem acesso aos valores monetários internos da clínica.

### Implementação Técnica

#### Arquitetura de Dados Segregada

```
┌─────────────────────────────────────┐
│  PostgreSQL - Clínica Sala 204      │
│  (Dr. Ricardo Mendes)               │
├─────────────────────────────────────┤
│  • faturamento_mensal               │
│    - receita_bruta: R$ 58.000,00    │
│    - despesas: R$ 20.000,00         │
│    - lucro_liquido: R$ 38.000,00    │
│                                     │
│  • convenios                        │
│    - unimed_valor: R$ 32.500,00     │
│    - bradesco_valor: R$ 21.000,00   │
│                                     │
│  🔐 Criptografia: AES-256-GCM       │
│  🔑 Chave única por clínica         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PostgreSQL - Administrador         │
│  (Gestão do Prédio)                 │
├─────────────────────────────────────┤
│  • ocupacao_salas                   │
│    - sala_204_pacientes: 130        │
│    - sala_204_horas_uso: 160h       │
│    - taxa_ocupacao: 92%             │
│                                     │
│  • repasses                         │
│    - sala_204_taxa_fixa: R$ 8.000   │
│    - facilities_usado: R$ 380       │
│    ❌ receita_medica: BLOQUEADO     │
│                                     │
│  📊 Apenas métricas operacionais    │
│  🚫 NUNCA valores financeiros       │
└─────────────────────────────────────┘
```

#### Políticas de Acesso

```typescript
// Exemplo de controle de acesso
interface DatabaseAccess {
  clinicDatabase: {
    owner: 'Dr. Ricardo Mendes',
    tables: {
      faturamento: { 
        access: ['OWNER_ONLY'],
        encryption: 'AES-256-GCM',
        keyRotation: '90 days'
      },
      convenios: {
        access: ['OWNER_ONLY'],
        encryption: 'AES-256-GCM'
      }
    }
  },
  
  adminDatabase: {
    owner: 'Hospital Admin',
    tables: {
      ocupacao_salas: {
        access: ['ADMIN'],
        fields: ['pacientes_count', 'horas_uso'],
        blockedFields: ['valor_consulta', 'receita']
      },
      repasses: {
        access: ['ADMIN', 'FINANCE'],
        fields: ['taxa_fixa', 'facilities_cobrado'],
        blockedFields: ['receita_total_clinica']
      }
    }
  }
}
```

---

## 🔄 Interoperabilidade Total: FHIR e HL7

### Padrões Implementados

#### FHIR R4 (Fast Healthcare Interoperability Resources)

O sistema utiliza FHIR R4 para comunicação entre prontuário médico e laboratório, eliminando duplicação de dados.

##### Fluxo de Solicitação de Exame

```json
// 1. Médico solicita exame (POST /fhir/ServiceRequest)
{
  "resourceType": "ServiceRequest",
  "id": "lab-req-12345",
  "status": "active",
  "intent": "order",
  "priority": "routine",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Complete blood count"
    }]
  },
  "subject": {
    "reference": "Patient/ana-carolina-souza",
    "display": "Ana Carolina Souza"
  },
  "requester": {
    "reference": "Practitioner/dr-ricardo-mendes",
    "display": "Dr. Ricardo Mendes - Sala 204"
  },
  "performer": [{
    "reference": "Organization/lab-central-3andar"
  }]
}
```

```json
// 2. Laboratório retorna resultado (DiagnosticReport)
{
  "resourceType": "DiagnosticReport",
  "id": "hemograma-ana-12345",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Hemograma Completo"
    }]
  },
  "subject": {
    "reference": "Patient/ana-carolina-souza"
  },
  "result": [{
    "reference": "Observation/hemoglobin-ana",
    "display": "Hemoglobina: 14.2 g/dL"
  }],
  "conclusion": "Hemograma dentro dos padrões normais"
}
```

##### Recursos FHIR Implementados

| Recurso | Descrição | Uso |
|---------|-----------|-----|
| `Patient` | Dados demográficos do paciente | Compartilhado entre médico e lab |
| `Practitioner` | Informações do profissional | Identificação do médico solicitante |
| `Organization` | Dados do laboratório/clínica | Rastreio de origem/destino |
| `ServiceRequest` | Solicitação de exame | Médico → Lab |
| `DiagnosticReport` | Resultado do exame | Lab → Médico |
| `Observation` | Valores individuais do exame | Componente do DiagnosticReport |

#### HL7 v2.x (Integração Legacy)

Para sistemas legados, o Hospital 360 suporta mensagens HL7 v2.

##### Exemplo: ADT^A01 - Admissão de Paciente

```
MSH|^~\&|HOSP360|SALA204|LAB|3ANDAR|20260421143000||ADT^A01|MSG00001|P|2.5
EVN|A01|20260421143000
PID|1||123456789^^^HOSP360^MR||SOUZA^ANA CAROLINA||19900315|F|||RUA DAS FLORES 123^^SAO PAULO^SP^01234567^BR
PV1|1|O|SALA204^01^01^HOSP360||||DR.RICARDO MENDES^RICARDO^MENDES^^^DR.
```

##### Exemplo: ORM^O01 - Pedido de Exame

```
MSH|^~\&|HOSP360|SALA204|LAB|3ANDAR|20260421143500||ORM^O01|MSG00002|P|2.5
PID|1||123456789^^^HOSP360^MR||SOUZA^ANA CAROLINA
ORC|NW|ORDER12345|||||^^^20260421||||DR.RICARDO MENDES
OBR|1|ORDER12345|LAB67890|HEMO^Hemograma Completo^HOSP360|||20260421143500
```

### Benefícios da Interoperabilidade

✅ **Zero Retrabalho**: Paciente não repete informações  
✅ **Sem Duplicação**: Fonte única de verdade  
✅ **Notificação Instantânea**: Médico alertado quando resultado fica pronto  
✅ **Auditoria Completa**: Rastreio de quem solicitou, processou e visualizou cada exame

---

## 🛡️ Segurança 360°

### Criptografia em Múltiplas Camadas

#### 1. Dados em Repouso (At Rest)

```yaml
Database Encryption:
  Engine: PostgreSQL 15+ with TDE (Transparent Data Encryption)
  Algorithm: AES-256-GCM
  Key Management: 
    - Chaves únicas por clínica
    - Rotação automática a cada 90 dias
    - Hardware Security Module (HSM) para armazenamento de chaves
  
Application-Level Encryption:
  Sensitive Fields:
    - CPF: AES-256-CBC
    - Valores Financeiros: AES-256-GCM
    - Telefones: AES-256-CBC
  Salt: Único por registro
  IV (Initialization Vector): Gerado aleatoriamente
```

#### 2. Dados em Trânsito (In Transit)

```yaml
Transport Security:
  Protocol: TLS 1.3
  Cipher Suites:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
  Certificate: 
    - Wildcard *.hospital360.com.br
    - Renovação automática (Let's Encrypt)
  Perfect Forward Secrecy: Enabled
  HSTS: max-age=31536000; includeSubDomains
```

### Autenticação Multi-Fator (MFA)

#### Fluxo de Login com MFA

```
1. Fator 1: Senha
   ├─ Mínimo 12 caracteres
   ├─ Maiúsculas + Minúsculas + Números + Símbolos
   ├─ Hash: Argon2id (memory-hard)
   └─ Salt: 32 bytes aleatórios

2. Fator 2: TOTP (Time-based One-Time Password)
   ├─ Algoritmo: TOTP-SHA256
   ├─ Janela: 30 segundos
   ├─ Apps suportados: Google Authenticator, Authy
   └─ Códigos de backup: 10 códigos únicos

3. Fator 3 (Opcional): Biometria
   ├─ Padrão: FIDO2 WebAuthn
   ├─ Tipos: Fingerprint, Face ID
   └─ Dispositivos: Registrados por usuário
```

#### Implementação de Exemplo

```typescript
// Exemplo de validação MFA
async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  // Fator 1: Senha
  const passwordHash = await argon2.hash(credentials.password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
  
  const passwordValid = await db.validatePassword(credentials.username, passwordHash);
  if (!passwordValid) {
    return { success: false, error: 'Invalid credentials' };
  }
  
  // Fator 2: TOTP
  const totpValid = authenticator.verify({
    token: credentials.totpCode,
    secret: user.totpSecret
  });
  
  if (!totpValid) {
    return { success: false, error: 'Invalid TOTP code' };
  }
  
  // Fator 3 (Opcional): Biometria
  if (credentials.biometricAssertion) {
    const biometricValid = await fido2.verifyAssertion({
      assertion: credentials.biometricAssertion,
      challenge: session.challenge,
      credentialId: user.webauthnCredentialId
    });
    
    if (!biometricValid) {
      return { success: false, error: 'Biometric verification failed' };
    }
  }
  
  return {
    success: true,
    token: generateJWT(user),
    refreshToken: generateRefreshToken(user)
  };
}
```

### Auditoria e Compliance

#### Rastreamento de Acessos

```sql
-- Tabela de auditoria
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB
);

-- Exemplo de log
INSERT INTO audit_log (user_id, action, resource_type, resource_id, success)
VALUES (
  'dr-ricardo-mendes',
  'VIEW_EXAM_RESULT',
  'DiagnosticReport',
  'hemograma-ana-12345',
  true
);
```

#### Conformidade LGPD

| Requisito LGPD | Implementação Hospital 360 |
|----------------|----------------------------|
| **Consentimento** | Termo de consentimento digital com timestamp e IP |
| **Finalidade** | Uso de dados apenas para atendimento médico |
| **Adequação** | Coleta mínima de dados necessários |
| **Transparência** | Dashboard de privacidade para pacientes |
| **Segurança** | Criptografia AES-256 + MFA |
| **Direito de Acesso** | Paciente pode exportar seus dados (FHIR JSON) |
| **Direito de Exclusão** | Anonimização após 20 anos (CFM 1.821/2007) |
| **Portabilidade** | Exportação em formato FHIR R4 |

### Política de Backup (Regra 3-2-1)

```
3 Cópias dos Dados
├─ 1 cópia primária (PostgreSQL principal)
├─ 1 cópia standby (PostgreSQL replicação síncrona)
└─ 1 cópia backup (S3 Glacier)

2 Mídias Diferentes
├─ SSD local (PostgreSQL)
└─ Object Storage (S3)

1 Cópia Offsite
└─ S3 Multi-Region (us-east-1 + sa-east-1)

Retenção:
├─ Diário: 7 dias
├─ Semanal: 4 semanas
├─ Mensal: 12 meses
└─ Anual: 20 anos (conformidade CFM)
```

---

## 🏗️ Arquitetura de Infraestrutura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                   Load Balancer (TLS 1.3)               │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌───────────────┐            ┌───────────────┐
│  API Gateway  │            │  API Gateway  │
│   (Node.js)   │            │   (Node.js)   │
└───────┬───────┘            └───────┬───────┘
        │                            │
        └─────────────┬──────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌───────────────┐            ┌───────────────┐
│  PostgreSQL   │◄──────────►│  PostgreSQL   │
│   Primary     │  Streaming │   Standby     │
│               │  Replication│               │
└───────┬───────┘            └───────────────┘
        │
        │ Backup
        ▼
┌───────────────┐
│  S3 Glacier   │
│ (Multi-Region)│
└───────────────┘
```

### Escalabilidade

- **Horizontal**: Auto-scaling de API Gateways (min: 2, max: 10)
- **Vertical**: PostgreSQL com 32 vCPU, 128GB RAM
- **Replicação**: Standby síncrono para leitura

---

## 📊 Métricas de Segurança

### KPIs Monitorados

```yaml
Security KPIs:
  - Failed Login Attempts: < 5 por minuto
  - Mean Time to Detect (MTTD): < 5 minutos
  - Mean Time to Respond (MTTR): < 30 minutos
  - Encryption Coverage: 100% dados sensíveis
  - MFA Adoption Rate: > 95%
  - Vulnerability Patching: < 24h para críticas
  - Backup Success Rate: > 99.9%
  - Data Loss: 0 bytes (RPO = 0)
```

---

## 🔐 Resumo Executivo

O Hospital 360 implementa segurança de nível bancário com:

✅ **Autonomia Financeira**: Cada clínica com PostgreSQL isolado + AES-256  
✅ **Interoperabilidade**: FHIR R4 + HL7 para zero duplicação de dados  
✅ **MFA Obrigatório**: 3 fatores de autenticação  
✅ **Criptografia Total**: Em repouso (AES-256-GCM) e trânsito (TLS 1.3)  
✅ **Auditoria Completa**: Rastreio de todos os acessos  
✅ **Compliance**: LGPD + CFM 1.821/2007  
✅ **Backup 3-2-1**: Zero data loss (RPO = 0)  

**Resultado**: Cada médico proprietário possui total privacidade sobre seus dados financeiros, enquanto o sistema garante integração perfeita para melhorar o atendimento ao paciente.
