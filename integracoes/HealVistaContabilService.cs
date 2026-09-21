// ============================================================================
// HOSPITAL 360 - SPRINT 3: SISTEMA CONTÁBIL HEALVISTA & EMISSÃO DE NFS-E (.NET 8)
// Responsável Técnico: André Castilho (Engenheiro Backend / Fintech & Contábil)
// Padrão: C# ASP.NET Core 8+, Minimal API & Clean Architecture (dotnet-backend)
// ============================================================================

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Hospital360.HealVista.Contabil
{
    public record SplitFinanceiroDto(
        string TransacaoId,
        string PacienteId,
        string ClinicaId,
        decimal ValorTotal,
        decimal ValorClinica85,
        decimal ValorCondominio15,
        string MetodoPagamento
    );

    public record NfseEmitidaDto(
        string NumeroNota,
        string CodigoVerificacao,
        DateTime DataEmissao,
        string PrestadorCnpj,
        string TomadorCpfAnonimizado,
        decimal ValorServicos,
        decimal AliquotaIss,
        decimal ValorIss,
        decimal ValorLiquido,
        string DiscriminacaoServicos,
        string Status
    );

    public record LancamentoContabilDto(
        string IdLancamento,
        DateTime DataLancamento,
        string ContaDebito,
        string ContaCredito,
        decimal Valor,
        string Historico
    );

    public interface IHealVistaContabilService
    {
        Task<NfseEmitidaDto> EmitirNfseMunicipalAsync(SplitFinanceiroDto split, string cpfPaciente);
        Task<List<LancamentoContabilDto>> EscriturarLivroDiarioAsync(SplitFinanceiroDto split);
    }

    public class HealVistaContabilService : IHealVistaContabilService
    {
        private const string CnpjHospital = "44.921.840/0001-92";
        private const decimal AliquotaIssPadrao = 0.05m; // 5% ISS Municipal

        public async Task<NfseEmitidaDto> EmitirNfseMunicipalAsync(SplitFinanceiroDto split, string cpfPaciente)
        {
            await Task.Yield(); // Operação assíncrona simulada

            string numeroNota = $"NFS-{DateTime.UtcNow:yyyyMMdd}-{RandomNumberGenerator.GetInt32(1000, 9999)}";
            string codigoVerificacao = GerarCodigoVerificacaoSha256(numeroNota, split.ValorCondominio15);
            
            // ISS incide sobre a taxa de administração condominial
            decimal valorBaseCalculo = split.ValorCondominio15;
            decimal valorIss = Math.Round(valorBaseCalculo * AliquotaIssPadrao, 2);
            decimal valorLiquido = valorBaseCalculo - valorIss;

            string cpfAnon = AnonimizarCpf(cpfPaciente);

            return new NfseEmitidaDto(
                NumeroNota: numeroNota,
                CodigoVerificacao: codigoVerificacao,
                DataEmissao: DateTime.UtcNow,
                PrestadorCnpj: CnpjHospital,
                TomadorCpfAnonimizado: cpfAnon,
                ValorServicos: valorBaseCalculo,
                AliquotaIss: AliquotaIssPadrao,
                ValorIss: valorIss,
                ValorLiquido: valorLiquido,
                DiscriminacaoServicos: $"Taxa de Infraestrutura e Condomínio Hospitalar ref. Consulta Médica Sala 204. Split Transação {split.TransacaoId}.",
                Status: "EMITIDA_HOMOLOGADA_PREFEITURA"
            );
        }

        public async Task<List<LancamentoContabilDto>> EscriturarLivroDiarioAsync(SplitFinanceiroDto split)
        {
            await Task.Yield();

            var lancamentos = new List<LancamentoContabilDto>
            {
                // D: Banco Conta Movimento (Ativo Circulante)
                // C: Receita de Condomínio Hospitalar (Resultado)
                new LancamentoContabilDto(
                    IdLancamento: $"LAN-{Guid.NewGuid():N}"[..12].ToUpper(),
                    DataLancamento: DateTime.UtcNow,
                    ContaDebito: "1.1.1.05 - Banco do Brasil / PIX Liquidado",
                    ContaCredito: "3.1.1.02 - Receita de Locação & Taxa Condomínio",
                    Valor: split.ValorCondominio15,
                    Historico: $"Recebimento taxa condominial split consulta {split.TransacaoId}"
                ),
                // Repasse para a Conta do Médico Cooperado (Passivo Transitório)
                new LancamentoContabilDto(
                    IdLancamento: $"LAN-{Guid.NewGuid():N}"[..12].ToUpper(),
                    DataLancamento: DateTime.UtcNow,
                    ContaDebito: "2.1.3.01 - Repasses Médicos a Liquidar (85%)",
                    ContaCredito: "1.1.1.05 - Banco do Brasil / PIX Liquidado",
                    Valor: split.ValorClinica85,
                    Historico: $"Repasse automático via Hyperswitch para o cooperado Sala 204"
                )
            };

            return lancamentos;
        }

        private static string GerarCodigoVerificacaoSha256(string seed, decimal valor)
        {
            using var sha = SHA256.Create();
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes($"{seed}-{valor}-{DateTime.UtcNow.Ticks}"));
            return Convert.ToHexString(bytes)[..16];
        }

        private static string AnonimizarCpf(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf) || cpf.Length < 11) return "***.***.***-**";
            return $"{cpf[..3]}.***.***-{cpf[^2..]}";
        }
    }
}
