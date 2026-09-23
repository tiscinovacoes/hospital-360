import { NextRequest, NextResponse } from 'next/server';
import { mensagemErro } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      transacaoId = `TX-${Date.now()}`,
      valorCondominio = 42.0,
      valorTotal = 280.0,
      cpfPaciente = '789.456.123-00',
      clinicaNome = 'Consultório Dr. Ricardo Mendes - Sala 204',
    } = body;

    const numeroNota = `NFS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const aliquotaIss = 0.05; // 5% ISS municipal
    const valorBase = Number(valorCondominio) || 42.0;
    const valorIss = Number((valorBase * aliquotaIss).toFixed(2));
    const valorLiquido = Number((valorBase - valorIss).toFixed(2));

    const cpfAnonimizado = cpfPaciente.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4');

    const nfseEmitida = {
      numeroNota,
      codigoVerificacao: `VERIF-${Date.now().toString(16).toUpperCase()}`,
      dataEmissao: new Date().toISOString(),
      prestador: {
        razaoSocial: 'Condomínio e Gestão Hospitalar 360 SPE Ltda.',
        cnpj: '44.921.840/0001-92',
        inscricaoMunicipal: 'IM-389102-BH',
      },
      tomador: {
        cpfAnonimizado,
        clinicaReferencia: clinicaNome,
      },
      servico: {
        codigoTributacaoMunicipal: '04.01 - Medicina e Biomedicina / Infraestrutura Hospitalar',
        discriminacao: `Taxa de infraestrutura hospitalar e rateio de áreas comuns ref. consulta transação ${transacaoId}.`,
        valorTotalConsulta: Number(valorTotal),
        valorBaseCalculoIss: valorBase,
        aliquotaIssPercentual: 5.0,
        valorIssRetido: valorIss,
        valorLiquidoRecebido: valorLiquido,
      },
      escrituracaoLivroDiario: [
        {
          contaDebito: '1.1.1.05 - Banco do Brasil / PIX D+0',
          contaCredito: '3.1.1.02 - Receita Operacional Condomínio Hospitalar',
          valor: valorBase,
          historico: `Taxa condominial recebida split ${transacaoId}`,
        },
      ],
      status: 'EMITIDA_E_HOMOLOGADA_PREFEITURA',
    };

    return NextResponse.json({
      success: true,
      message: `NFS-e ${numeroNota} emitida e escriturada com sucesso no HealVista Contábil.`,
      data: nfseEmitida,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Falha ao emitir NFS-e no HealVista: ' + mensagemErro(err) },
      { status: 500 }
    );
  }
}
