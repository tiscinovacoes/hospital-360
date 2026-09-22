---
name: cmed-bps-catmat-validator
description: >
  Microservice for validating supplier medicine prices against three official
  Brazilian government tables: CATMAT (standardization), BPS (SUS reference price),
  and CMED (legal ceiling). Simple lookup + comparison, no business logic.
  Designed for embedding in procurement systems (e-Pesquisa, Comprasnet).
  Returns conformance status + divergence details + audit trail.
triggers:
  - "validating medicine prices against gov tables"
  - "CATMAT + BPS + CMED comparison"
  - "price conformance API for licitações"
  - "supplier validation for healthcare procurement"
  - "checking prices against CMED ceiling"
---

# CMED-BPS-CATMAT Validator Microservice

## What It Does (Scope)

**In:** `{ supplier_medicine_name, supplier_price }`
**Out:** `{ conformance_status, bps_price, cmed_price, divergence_reasons, audit_log_id }`

**What it does NOT do:**
- Does not invent or analyze pricing
- Does not make approval decisions (only data)
- Does not mandate thresholds (integrator system decides action)
- Does not handle payment, contracts, or procurement workflow

**What it DOES do:**
- Normalizes medicine name using CATMAT
- Looks up official prices from BPS + CMED
- Compares supplier price to both
- Returns structured result + immutable audit entry
- Can regenerate past validations using original table snapshots

---

## Architecture

### 1. Data Layer (Versioned Snapshots)

**Three independent tables, synced on different schedules:**

```
PostgreSQL (or DynamoDB)
├── catmat_v1_2026_04_24 (codigo_br, nome_padrao, alias_1, alias_2, unit_std)
├── catmat_v1_2026_05_01
├── bps_v1_2026_04_17 (codigo_br, price_nus, unit, manufacturer, last_update)
├── bps_v1_2026_04_24
├── cmed_v1_2026_04_15 (codigo_br, commercial_name, price_max, unit, date_eff)
├── cmed_v1_2026_04_16
├── cmed_v1_2026_04_17
│
├── validation_audit (id, timestamp, request, matched_codigo_br, matched_via, 
│   bps_price, cmed_price, supplier_price, status, reason, catmat_version,
│   bps_version, cmed_version, integrator_id, final_decision)
│
└── integration_log (api_call_id, endpoint, status_code, response_time,
    rate_limit_remaining, error_msg)
```

**Key design:**
- Each table is versioned independently (CMED may have v1, v2, v3 same week; BPS still on v1)
- `validation_audit` stores references to which versions were used
- **Replayability:** Given `audit_log_id`, query original versions + regenerate exact same result

### 2. ETL Layer (3 Independent Jobs)

#### Job A: CATMAT Sync (Weekly)
```
Source: https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos
Format: CSV
Schedule: Monday 2am UTC
Steps:
  1. Download
  2. Parse (codigo_br, nome_padrao, aliases, unit)
  3. Validate (no nulls in codigo_br, duplicates?)
  4. Insert as catmat_v1_YYYY_MM_DD
  5. Keep last 4 versions (3 months rolling)
  6. Alert if row count changed >5% (data integrity check)
```

#### Job B: BPS Sync (Weekly)
```
Source: https://www.gov.br/saude/pt-br/acesso-a-informacao/banco-de-precos
Format: XLSX or CSV (check current API)
Schedule: Tuesday 2am UTC (offset from CATMAT to detect conflicts)
Steps:
  1. Download
  2. Parse (codigo_br, price_nus, unit, manufacturer, date)
  3. Normalize units (convert all to mg or mL as needed)
  4. Validate (price > 0, codigo_br matches CATMAT in 90%+ cases)
  5. Insert as bps_v1_YYYY_MM_DD
  6. Keep last 8 versions (2 months rolling)
  7. Alert if any price dropped >50% (possible data error)
```

#### Job C: CMED Sync (Daily or more frequent)
```
Source: https://app.powerbi.com/view?r=eyJrIjoiYjZkZjEyM2YtNzNjYS00ZmQyLTliYTEtNDE2MDc4ZmE1NDEyIiwidCI6ImI2N2FmMjNmLWMzZjMtNGQzNS04MGM3LWI3MDg1ZjVlZGQ4MSJ9
Format: PowerBI (requires headless browser OR check if API exists)
Schedule: Daily 6am + 2pm + 8pm UTC (frequent updates)
Steps:
  1. Download/scrape (may need Playwright + Puppeteer if no API)
  2. Parse (codigo_br, commercial_name, price_max, unit, effective_date)
  3. Validate (price > 0, codigo_br matches CATMAT in 85%+ cases)
  4. Deduplicate (same codigo_br + same effective_date = skip)
  5. Insert as cmed_v1_YYYY_MM_DD
  6. Keep last 30 versions (rolling month)
  7. Alert if price jumped >30% (unusual)
```

**ETL Tool Options:**
- Node.js: `node-cron` + `node-fetch` + `puppeteer` (simple, fits in container)
- Python: `APScheduler` + `requests` + `beautifulsoup4` (more robust)
- Cloud: AWS Lambda + EventBridge (serverless, pay-per-call)

---

### 3. Matching Engine

**Goal:** Convert supplier's `"Dipirona 500mg"` → CATMAT's `codigo_br = "1234567890"`

**Three strategies (in order of preference):**

#### Strategy 1: Exact Code BR
```
If supplier provides: { codigo_br: "1234567890" }
  → Query CATMAT by codigo_br
  → If found: use it
  → If not found: mark as "codigo_br_not_in_current_catmat" (may be old code)
```

#### Strategy 2: Fuzzy Match on Name
```
If supplier provides: { name: "Dipirona 500mg comprimido" }
  → Normalize: lowercase, remove accents, remove extra spaces
  → Search CATMAT.nome_padrao using Levenshtein distance
  → If distance > 0.85 (85% match): use it
  → If distance < 0.85: try aliases (nome_padrao column has comma-separated aliases)
```

**Python code sketch:**
```python
from fuzzywuzzy import fuzz

def match_medication(supplier_name, catmat_df):
    normalized = unidecode(supplier_name.lower().strip())
    
    # Try exact match first
    exact = catmat_df[catmat_df['nome_padrao'].str.lower() == normalized]
    if len(exact) == 1:
        return exact.iloc[0]['codigo_br'], 'exact_match', 1.0
    
    # Try fuzzy match on nome_padrao
    best_ratio = 0
    best_row = None
    for idx, row in catmat_df.iterrows():
        ratio = fuzz.token_sort_ratio(normalized, row['nome_padrao'].lower())
        if ratio > best_ratio:
            best_ratio = ratio
            best_row = row
    
    if best_ratio > 0.85:
        return best_row['codigo_br'], 'fuzzy_match_nome', best_ratio
    
    # Try aliases
    for idx, row in catmat_df.iterrows():
        aliases = row['aliases'].split(',') if row['aliases'] else []
        for alias in aliases:
            ratio = fuzz.token_sort_ratio(normalized, alias.lower())
            if ratio > 0.85 and ratio > best_ratio:
                best_ratio = ratio
                best_row = row
    
    if best_ratio > 0.85:
        return best_row['codigo_br'], 'fuzzy_match_alias', best_ratio
    
    return None, 'no_match', best_ratio
```

#### Strategy 3: Manual Override (for edge cases)
```
If fuzzy match fails:
  → Return { status: 'MATCH_FAILED', confidence: X%, suggested_matches: [...] }
  → Integrator system prompts user to pick from suggestions
  → User selection stored in manual_match_overrides table
  → Next time same input → use override (learning)
```

**Quality Baseline:**
- Matching accuracy must be > 95% for MVP to pass
- Test against 100+ real supplier submissions before release
- Log every failed match + reason (for debugging)

---

### 4. Comparison Logic

**Given matched `codigo_br`, look up prices and compare:**

```python
def validate_price(codigo_br, supplier_price, catmat_ver, bps_ver, cmed_ver):
    """
    Returns: {
      conformance_status: 'OK' | 'WARNING' | 'ILLEGAL' | 'NOT_FOUND' | 'ERROR'
      bps_price: float or None
      cmed_price: float or None
      divergence_percent_vs_bps: float or None
      divergence_percent_vs_cmed: float or None
      reason: str (human readable)
      recommendation: str
    }
    """
    
    # Look up prices from latest versions
    bps_row = query_bps(codigo_br, bps_ver)
    cmed_row = query_cmed(codigo_br, cmed_ver)
    
    # Case 1: Found in both
    if bps_row and cmed_row:
        bps_price = bps_row['price']
        cmed_price = cmed_row['price_max']
        
        if supplier_price > cmed_price:
            return {
              'status': 'ILLEGAL',
              'bps_price': bps_price,
              'cmed_price': cmed_price,
              'divergence_vs_cmed': (supplier_price - cmed_price) / cmed_price * 100,
              'reason': f'Supplier price R${supplier_price:.2f} exceeds legal ceiling R${cmed_price:.2f}',
              'recommendation': 'REJECT (violates CMED ceiling)',
              'severity': 'CRITICAL'
            }
        elif supplier_price > bps_price:
            return {
              'status': 'WARNING',
              'bps_price': bps_price,
              'cmed_price': cmed_price,
              'divergence_vs_bps': (supplier_price - bps_price) / bps_price * 100,
              'reason': f'Supplier price R${supplier_price:.2f} exceeds SUS reference R${bps_price:.2f}',
              'recommendation': 'FLAG for review (above SUS reference)',
              'severity': 'WARNING'
            }
        else:
            return {
              'status': 'OK',
              'bps_price': bps_price,
              'cmed_price': cmed_price,
              'reason': f'Within SUS reference (BPS R${bps_price:.2f})',
              'recommendation': 'APPROVE',
              'severity': 'INFO'
            }
    
    # Case 2: Found in CMED only (orphan drug, not in SUS)
    elif cmed_row and not bps_row:
        cmed_price = cmed_row['price_max']
        if supplier_price > cmed_price:
            return { 'status': 'ILLEGAL', ... }
        else:
            return {
              'status': 'OK',
              'bps_price': None,
              'cmed_price': cmed_price,
              'reason': f'Orphan drug (not in SUS). Within CMED ceiling R${cmed_price:.2f}',
              'recommendation': 'APPROVE (with note: not reimbursed by SUS)',
              'severity': 'INFO'
            }
    
    # Case 3: Found in BPS only (unlikely, but handle)
    elif bps_row and not cmed_row:
        return {
          'status': 'WARNING',
          'bps_price': bps_row['price'],
          'cmed_price': None,
          'reason': 'Medication in SUS reference but not in CMED (check for discontinuation)',
          'recommendation': 'VERIFY with ANVISA',
          'severity': 'WARNING'
        }
    
    # Case 4: Not found in either
    else:
        return {
          'status': 'NOT_FOUND',
          'reason': 'Medication not found in CATMAT/BPS/CMED',
          'recommendation': 'MANUAL RESEARCH REQUIRED',
          'severity': 'ERROR'
        }
```

---

### 5. API Layer

#### Endpoint: POST /api/v1/validate

**Request:**
```json
{
  "supplier_medicine": {
    "name_or_code": "Dipirona 500mg",
    "unit_price": 2.50,
    "quantity": 1000,
    "lote": "123ABC",
    "integrator_id": "e-pesquisa-rs"
  }
}
```

**Response (200 OK):**
```json
{
  "audit_log_id": "val_abc123def456",
  "timestamp": "2026-04-24T14:30:00Z",
  "matched_medication": {
    "codigo_br": "1234567890",
    "catmat_name": "Dipirona 500mg comprimido",
    "match_method": "fuzzy_match_nome",
    "match_confidence": 0.94
  },
  "prices": {
    "supplier_price": 2.50,
    "bps_price": 2.00,
    "cmed_price": 3.00
  },
  "validation": {
    "status": "WARNING",
    "divergence_vs_bps_percent": 25.0,
    "divergence_vs_cmed_percent": -16.67,
    "reason": "Supplier price R$2.50 exceeds SUS reference R$2.00 but is within CMED ceiling R$3.00",
    "recommendation": "FLAG for review"
  },
  "versions_used": {
    "catmat_version": "2026_04_24",
    "bps_version": "2026_04_24",
    "cmed_version": "2026_04_24"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "MATCH_FAILED",
  "supplier_medicine": "Xyz 999mg unknown",
  "suggested_matches": [
    { "codigo_br": "...", "name": "...", "confidence": 0.72 },
    { "codigo_br": "...", "name": "...", "confidence": 0.68 }
  ],
  "audit_log_id": "val_xyz789",
  "recommendation": "Manual match required. Suggest: pick from suggested_matches or provide codigo_br"
}
```

#### Endpoint: GET /api/v1/prices/{codigo_br}

**Quick lookup without validation.**

Request:
```
GET /api/v1/prices/1234567890
```

Response:
```json
{
  "codigo_br": "1234567890",
  "name": "Dipirona 500mg comprimido",
  "prices": {
    "bps": { "value": 2.00, "date": "2026_04_24" },
    "cmed": { "value": 3.00, "date": "2026_04_24" }
  }
}
```

#### Endpoint: GET /api/v1/audit/{audit_log_id}

**Retrieve past validation (replayable).**

```json
{
  "audit_log_id": "val_abc123",
  "request": { ... original request ... },
  "response": { ... original response ... },
  "versions_used": { ... exact versions ... },
  "decision_by_integrator": {
    "approved": true,
    "reason": "Price acceptable for this hospital contract",
    "timestamp": "2026_04_24T16:00:00Z",
    "decided_by": "gsm@hospital.br"
  },
  "exportable_report": "https://api.../audit/val_abc123/export.pdf"
}
```

#### Endpoint: POST /api/v1/audit/{audit_log_id}/export

**Generate signed PDF for compliance.**

```json
{
  "format": "pdf",
  "signature_type": "digital_signature_rsassa_pkcs_7"
}
```

Returns PDF with:
- Original validation request
- Result (status, prices, divergence)
- Exact table versions used (hash + timestamp)
- Integrator's final decision (approved/rejected)
- QR code linking to audit trail (replayable)

---

### 6. Audit Trail (Immutable)

**Every validation creates an immutable record:**

```sql
CREATE TABLE validation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Request details
  integrator_id VARCHAR(255),
  endpoint_called VARCHAR(50),
  supplier_medicine_name VARCHAR(500),
  supplier_price DECIMAL(10, 4),
  
  -- Matching details
  matched_codigo_br VARCHAR(20),
  matched_via VARCHAR(50), -- 'exact_code', 'fuzzy_nome', 'fuzzy_alias', 'manual', 'failed'
  match_confidence DECIMAL(3, 2),
  
  -- Table versions used
  catmat_version VARCHAR(50),
  bps_version VARCHAR(50),
  cmed_version VARCHAR(50),
  
  -- Prices looked up
  bps_price DECIMAL(10, 4),
  cmed_price DECIMAL(10, 4),
  
  -- Result
  validation_status VARCHAR(50), -- OK, WARNING, ILLEGAL, NOT_FOUND
  divergence_vs_bps_percent DECIMAL(5, 2),
  divergence_vs_cmed_percent DECIMAL(5, 2),
  recommendation TEXT,
  
  -- Integrator's decision
  integrator_decision VARCHAR(50), -- APPROVED, REJECTED, DEFERRED
  integrator_decision_reason TEXT,
  integrator_decision_timestamp TIMESTAMP WITH TIME ZONE,
  decided_by_user VARCHAR(255),
  
  -- Metadata
  response_time_ms INTEGER,
  client_ip INET,
  user_agent TEXT,
  
  -- Immutability
  hash VARCHAR(64), -- SHA256 of all above
  signature VARCHAR(4096), -- RSA signature of hash
  signer_key_id VARCHAR(255)
);

CREATE INDEX idx_audit_integrator ON validation_audit(integrator_id);
CREATE INDEX idx_audit_codigo_br ON validation_audit(matched_codigo_br);
CREATE INDEX idx_audit_created ON validation_audit(created_at);
```

**Immutability enforcement:**
- No UPDATE or DELETE allowed on audit table (only INSERT)
- Hash verification on every read (integrity check)
- Daily backup with immutable storage (S3 with versioning lock)
- Annual archive to cold storage (Glacier)

---

### 7. Monitoring & Alerting

**Key metrics:**

```
- Matching accuracy (% of validations with high-confidence matches)
- API latency (p50, p95, p99)
- ETL job success rate (all 3 jobs must succeed)
- Data freshness (when was CMED last updated?)
- Conformance ratio (% of suppliers at OK vs WARNING vs ILLEGAL)
```

**Alerts:**

```
IF catmat last sync > 8 days AGO → ALERT "CATMAT is stale"
IF bps last sync > 8 days AGO → ALERT "BPS is stale"
IF cmed last sync > 2 days AGO → ALERT "CMED is stale"
IF matching accuracy < 95% → ALERT "Matching degraded"
IF API p99 latency > 500ms → ALERT "API slow"
IF ETL job fails → ALERT "ETL pipeline broken"
```

---

## Implementation Roadmap

### Phase 1: MVP (3 weeks)
- [x] Schema (CATMAT, BPS, CMED tables)
- [x] ETL jobs (download, parse, insert)
- [x] Matching engine (code BR + fuzzy)
- [x] Comparison logic (3 cases)
- [x] API endpoint POST /validate
- [x] Audit trail (basic logging)
- [x] Tests (95%+ matching accuracy on 100 samples)

### Phase 2: Production-Ready (2 weeks)
- [x] Digital signatures (audit export)
- [x] Error handling + edge cases
- [x] Monitoring + alerting
- [x] Rate limiting (100 req/min per integrator)
- [x] Documentation (OpenAPI/Swagger)
- [x] Deploy (Docker + Kubernetes or serverless)

### Phase 3: Scale & Integrate (ongoing)
- [x] Multi-integrator support
- [x] SLA monitoring (99.5%)
- [x] DR & failover
- [x] Analytics dashboard
- [x] Webhook notifications (for large batches)

---

## Tech Stack Recommendation

**Backend:**
- Runtime: Node.js 20 + TypeScript (or Python 3.11)
- Framework: Express/Fastify (Node) or FastAPI (Python)
- DB: PostgreSQL 15 (ACID + versioning) or DynamoDB (serverless)
- Matching: fuzzywuzzy (Python) or fuzzy-search (Node)
- Scheduler: node-cron (Node) or APScheduler (Python)
- Browser automation (for PowerBI): Puppeteer (Node) or Playwright (Python)
- Signing: node-jose or cryptography (Python)

**Infrastructure:**
- Dev: Docker Compose (Postgres + API)
- Staging: Single container on server
- Prod: AWS ECS/K8s + RDS (multi-AZ) + CloudFront (CDN)
- Cost: ~R$ 2-5k/month

**Deployment:**
- GitHub Actions (CI/CD)
- Blue-green deployment (zero downtime)
- Database migrations (Flyway or Alembic)
- Monitoring: Prometheus + Grafana + CloudWatch

---

## API Security

```
POST /api/v1/validate

Authentication: API Key (Bearer token)
Rate limiting: 100 req/min per API key
TLS: 1.3+ required
CORS: Integrator origins only
Signature: All responses signed with RSA-2048

Header validation:
  X-Request-ID: UUID (for tracing)
  X-Integrator-ID: mandatory (who called?)
  X-Timestamp: ISO8601 (prevent replay)
```

---

## Success Criteria

1. **Matching accuracy > 95%** on real supplier data
2. **API latency < 200ms p99** for single requests
3. **ETL jobs 99.9% success rate** (3 jobs, independent)
4. **Audit trail** 100% coverage (every request logged + signed)
5. **Data freshness** (CMED < 2 days, BPS < 7 days, CATMAT < 30 days)
6. **Integrator onboarding** < 2 hours (docs + API key generation)
7. **SLA 99.5%** (planned downtime excludes outages)

---

## Cost Estimation

- **Development:** R$ 80-120k (2-3 devs × 4-5 weeks)
- **Infrastructure (annual):** R$ 30-60k (Postgres + API container + backups)
- **Operations (annual):** R$ 40-80k (SRE 0.5 FTE + support)
- **Total Year 1:** R$ 150-260k

**ROI:** If saves R$ 500k-2M/year in prevented procurement errors, payback in 1-3 months.

