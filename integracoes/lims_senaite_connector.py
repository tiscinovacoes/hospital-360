"""
HOSPITAL 360 - SPRINT 3: CONECTOR SENAITE LIMS (LABORATÓRIO CLÍNICO & DIAGNÓSTICO)
Responsável Técnico: Felipe Vasconcelos (Engenheiro Python / LIMS)
Padrão: Python 3.12+, Pydantic V2, Dataclasses & Async Patterns (python-pro)
"""

import asyncio
from datetime import datetime, timezone
import hashlib
import json
from typing import List, Optional
from pydantic import BaseModel, Field, computed_field


class ExameCatalogo(BaseModel):
    codigo_loinc: str
    nome: str
    prazo_minutos: int
    custo_reagentes: float
    custo_bancada_tecnica: float
    unidade_medida: str
    valor_referencia: str

    @computed_field
    @property
    def custo_total(self) -> float:
        return round(self.custo_reagentes + self.custo_bancada_tecnica, 2)


# Catálogo oficial do SENAITE LIMS integrado
CATALOGO_EXAMES = {
    "LOINC-1751-7": ExameCatalogo(
        codigo_loinc="LOINC-1751-7",
        nome="Hemograma Completo com Plaquetas",
        prazo_minutos=45,
        custo_reagentes=14.50,
        custo_bancada_tecnica=18.00,
        unidade_medida="Milhões/uL",
        valor_referencia="4.5 a 5.9 milhões/uL (Eritrócitos)",
    ),
    "LOINC-6598-7": ExameCatalogo(
        codigo_loinc="LOINC-6598-7",
        nome="Troponina I Cardíaca Ultrassensível",
        prazo_minutos=30,
        custo_reagentes=38.00,
        custo_bancada_tecnica=22.00,
        unidade_medida="ng/L",
        valor_referencia="< 14 ng/L (Normal / Não detectável)",
    ),
    "LOINC-1988-5": ExameCatalogo(
        codigo_loinc="LOINC-1988-5",
        nome="Proteína C-Reativa (PCR) Quantitativa",
        prazo_minutos=30,
        custo_reagentes=11.20,
        custo_bancada_tecnica=12.00,
        unidade_medida="mg/dL",
        valor_referencia="< 0.5 mg/dL",
    ),
    "LOINC-2093-3": ExameCatalogo(
        codigo_loinc="LOINC-2093-3",
        nome="Colesterol Total e Frações (Lipidograma)",
        prazo_minutos=60,
        custo_reagentes=16.80,
        custo_bancada_tecnica=15.00,
        unidade_medida="mg/dL",
        valor_referencia="< 190 mg/dL (Desejável)",
    ),
}


class SolicitacaoWorkOrder(BaseModel):
    paciente_id: str
    paciente_nome: str
    cpf: str
    medico_solicitante: str
    crm: str
    exames_solicitados: List[str] = Field(default_factory=list)
    prioridade: str = "URGENTE"
    centro_custo_origem: str = "AMBULATORIO_SALA204"


class ResultadoExame(BaseModel):
    codigo_loinc: str
    nome_exame: str
    resultado_encontrado: str
    unidade_medida: str
    valor_referencia: str
    status_analise: str = "CONCLUIDO_NORMAL"
    custo_apurado: float


class WorkOrderProcessada(BaseModel):
    workorder_id: str
    codigo_amostra_barcode: str
    timestamp_criacao: str
    timestamp_liberacao: str
    biomedico_responsavel: str = "Dr. Felipe Vasconcelos (CRBM/MS 4812)"
    paciente_id: str
    paciente_nome: str
    cpf_anonimizado: str
    status: str = "LAUDO_LIBERADO_ASSINADO"
    resultados: List[ResultadoExame]
    custo_total_laboratorio: float
    hash_assinatura_laudo: str
    pdf_laudo_url: str


class SenaiteLimsService:
    def __init__(self):
        self.catalogo = CATALOGO_EXAMES

    def gerar_codigo_barras_amostra(self, paciente_id: str, codigo_loinc: str) -> str:
        sufixo = hashlib.sha256(f"{paciente_id}-{codigo_loinc}-{datetime.now()}".encode()).hexdigest()[:8].upper()
        return f"SENAITE-{codigo_loinc}-{sufixo}"

    def anonimizar_cpf(self, cpf: str) -> str:
        limpo = "".join(filter(str.isdigit, cpf))
        if len(limpo) == 11:
            return f"{limpo[:3]}.***.***-{limpo[-2:]}"
        return "***.***.***-**"

    async def processar_workorder(self, solicitacao: SolicitacaoWorkOrder) -> WorkOrderProcessada:
        """Processa a ordem de serviço laboratorial, gera etiqueta e laudo assinado."""
        workorder_id = f"WO-LIMS-{int(datetime.now().timestamp() * 1000)}"
        agora = datetime.now(timezone.utc).isoformat()
        
        resultados = []
        custo_total = 0.0

        for loinc in solicitacao.exames_solicitados:
            exame = self.catalogo.get(loinc)
            if not exame:
                continue

            custo_total += exame.custo_total
            
            # Simulação de resultado clínico confiável
            resultado_valor = "9.2" if "Troponina" in exame.nome else "5.1" if "Hemograma" in exame.nome else "0.2"
            status_clinico = "NORMAL"

            resultados.append(
                ResultadoExame(
                    codigo_loinc=exame.codigo_loinc,
                    nome_exame=exame.nome,
                    resultado_encontrado=f"{resultado_valor} {exame.unidade_medida}",
                    unidade_medida=exame.unidade_medida,
                    valor_referencia=exame.valor_referencia,
                    status_analise=status_clinico,
                    custo_apurado=exame.custo_total,
                )
            )

        amostra_barcode = self.gerar_codigo_barras_amostra(
            solicitacao.paciente_id,
            solicitacao.exames_solicitados[0] if solicitacao.exames_solicitados else "EXAME",
        )

        hash_laudo = hashlib.sha256(
            f"{workorder_id}-{solicitacao.paciente_id}-{custo_total}".encode()
        ).hexdigest()

        return WorkOrderProcessada(
            workorder_id=workorder_id,
            codigo_amostra_barcode=amostra_barcode,
            timestamp_criacao=agora,
            timestamp_liberacao=agora,
            paciente_id=solicitacao.paciente_id,
            paciente_nome=solicitacao.paciente_nome,
            cpf_anonimizado=self.anonimizar_cpf(solicitacao.cpf),
            resultados=resultados,
            custo_total_laboratorio=round(custo_total, 2),
            hash_assinatura_laudo=hash_laudo,
            pdf_laudo_url=f"/laudos/senaite/{workorder_id}.pdf",
        )


async def main():
    service = SenaiteLimsService()
    pedido = SolicitacaoWorkOrder(
        paciente_id="PAC-789456",
        paciente_nome="Mariana Oliveira dos Santos",
        cpf="789.456.123-00",
        medico_solicitante="Dr. Ricardo Mendes",
        crm="CRM/MS 8492",
        exames_solicitados=["LOINC-6598-7", "LOINC-1751-7"],
    )

    print("Processando WorkOrder no SENAITE LIMS...")
    laudo = await service.processar_workorder(pedido)
    print(laudo.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main())
