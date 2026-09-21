//! HOSPITAL 360 - SPRINT 3: MOTOR DE SPLIT FINANCEIRO HYPERSWITCH (RUST 1.75+)
//! Responsável Técnico: André Castilho (Engenheiro Backend Rust / Fintech)
//! Padrão: Rust 1.75+, Tokio Async, Ponto Fixo em Centavos (rust-pro)

use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MetodoPagamento {
    PixD0,
    CartaoCredito,
    CartaoDebito,
    BoletoBancario,
}

#[derive(Debug, Clone)]
pub struct SplitRequest {
    pub transacao_id: String,
    pub paciente_id: String,
    pub clinica_id: String,
    pub valor_total_centavos: u64, // Ponto fixo: R$ 350,00 = 35000 centavos (evita float rounding)
    pub metodo: MetodoPagamento,
}

#[derive(Debug, Clone)]
pub struct SplitResult {
    pub transacao_id: String,
    pub valor_total_reais: f64,
    pub repasse_clinica_reais: f64,       // 85%
    pub taxa_condominio_reais: f64,       // 15%
    pub repasse_clinica_centavos: u64,
    pub taxa_condominio_centavos: u64,
    pub status: &'static str,
    pub liquidacao_imediata: bool,
    pub timestamp_epoch_ms: u128,
    pub hash_auditoria: String,
}

pub struct HyperswitchSplitEngine {
    percentual_clinica: u64, // 85
    percentual_condominio: u64, // 15
}

impl HyperswitchSplitEngine {
    pub fn new() -> Self {
        Self {
            percentual_clinica: 85,
            percentual_condominio: 15,
        }
    }

    /// Executa o cálculo determinístico de split financeiro com zero resíduo de centavos
    pub fn processar_split(&self, req: &SplitRequest) -> Result<SplitResult, &'static str> {
        if req.valor_total_centavos == 0 {
            return Err("Valor da transação deve ser superior a zero");
        }

        // Divisão inteira exata
        let clinica_centavos = (req.valor_total_centavos * self.percentual_clinica) / 100;
        let condominio_centavos = req.valor_total_centavos - clinica_centavos; // Garante que a soma é exatamente 100%

        let agora = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| "Falha de clock do sistema")?
            .as_millis();

        let hash_auditoria = format!(
            "HS-TX-{:x}-{:x}",
            req.valor_total_centavos, agora
        );

        Ok(SplitResult {
            transacao_id: req.transacao_id.clone(),
            valor_total_reais: req.valor_total_centavos as f64 / 100.0,
            repasse_clinica_reais: clinica_centavos as f64 / 100.0,
            taxa_condominio_reais: condominio_centavos as f64 / 100.0,
            repasse_clinica_centavos: clinica_centavos,
            taxa_condominio_centavos: condominio_centavos,
            status: "LIQUIDADO_PIX_D0",
            liquidacao_imediata: req.metodo == MetodoPagamento::PixD0,
            timestamp_epoch_ms: agora,
            hash_auditoria,
        })
    }
}

fn main() {
    let engine = HyperswitchSplitEngine::new();
    let req = SplitRequest {
        transacao_id: "TX-99182".to_string(),
        paciente_id: "PAC-789456".to_string(),
        clinica_id: "clinica_sala204".to_string(),
        valor_total_centavos: 28000, // R$ 280,00
        metodo: MetodoPagamento::PixD0,
    };

    match engine.processar_split(&req) {
        Ok(res) => {
            println!("=== HYPERSWITCH SPLIT REALIZADO (RUST 1.75) ===");
            println!("Transação: {}", res.transacao_id);
            println!("Valor Total: R$ {:.2}", res.valor_total_reais);
            println!("Repasse Clínica (85%): R$ {:.2}", res.repasse_clinica_reais);
            println!("Taxa Condomínio (15%): R$ {:.2}", res.taxa_condominio_reais);
            println!("Hash Auditoria: {}", res.hash_auditoria);
        }
        Err(e) => eprintln!("Erro: {}", e),
    }
}
