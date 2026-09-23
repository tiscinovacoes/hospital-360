"""
=============================================================================
HOSPITAL 360 — ESQUADRÃO DE AGENTES AUTÔNOMOS CREWAI (GO-TO-MARKET & GROWTH)
=============================================================================
Arquitetura Multi-Agente para Mineração de Leads (Apify), Precificação 
Psicológica (Decoy Effect) e Copywriting Institucional de Alta Conversão.
"""

from typing import List, Dict, Any
import json
import os

class CrewAgent:
    """Representação conceitual de um Agente CrewAI para governança e automação."""
    def __init__(self, role: str, goal: str, backstory: str, tools: List[str]):
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.tools = tools

    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "goal": self.goal,
            "backstory": self.backstory,
            "tools": self.tools
        }

class CrewTask:
    """Representação de uma tarefa delegada a um agente CrewAI."""
    def __init__(self, description: str, expected_output: str, agent: CrewAgent):
        self.description = description
        self.expected_output = expected_output
        self.agent = agent

    def to_dict(self) -> Dict[str, Any]:
        return {
            "description": self.description,
            "expected_output": self.expected_output,
            "agent_role": self.agent.role
        }

def build_hospital360_growth_crew() -> Dict[str, Any]:
    # 1. Agente 1: Lead Hunter Sênior (Apify Actor Specialist)
    lead_hunter = CrewAgent(
        role="Lead Hunter & Data Mining Specialist (Apify Master)",
        goal="Minerar e qualificar 500 Secretarias Municipais de Saúde e 200 Hospitais Privados/Filantrópicos no Brasil",
        backstory="""Especialista em inteligência competitiva e raspagem de dados públicos regulatórios.
        Domina o uso de Apify Actors para consultar o Cadastro Nacional de Estabelecimentos de Saúde (CNES),
        portais de transparência de compras públicas de saúde e diretórios de diretores clínicos no LinkedIn.""",
        tools=["apify/cnes-scraper", "apify/transparencia-saude-actor", "apify/linkedin-executives-crawler"]
    )

    # 2. Agente 2: Estrategista de Psicologia de Preços (Price Psychology Strategist)
    pricing_strategist = CrewAgent(
        role="Behavioral Economics & Price Psychology Strategist",
        goal="Estruturar a oferta comercial do Hospital 360 usando ancoragem pelo desperdício evitado e Decoy Effect",
        backstory="""Economista comportamental com vasta experiência em precificação de produtos B2B Enterprise de Saúde.
        Sabe que hospitais não compram 'recursos', compram estancamento de sangria financeira.
        Aplica com rigor o efeito chamariz e a ancoragem de valor no prejuízo mensal de glosas (R$ 180k a R$ 450k/mês).""",
        tools=["financial-roi-modeler", "decoy-tier-calibrator", "cmed-glosa-loss-estimator"]
    )

    # 3. Agente 3: Psicólogo de Copywriting & Redação Médica Institucional
    copywriting_expert = CrewAgent(
        role="Medical Copywriting Psychologist & Institutional Communicator",
        goal="Criar cadências de cold-outreach via WhatsApp institucional (Poli) e e-mail com taxa de resposta > 28%",
        backstory="""Especialista em comunicação persuasiva para o ecossistema médico e jurídico-sanitário.
        Abomina clichês de SaaS como 'revolucionário' ou 'IA mágica'. Escreve com o rigor técnico de um auditor
        do TCU e a assertividade de um cirurgião: fala de Lei 14.133/21, glosas TUSS e bloqueio Anvisa de lotes vencidos.""",
        tools=["tone-compliance-checker", "spam-filter-bypass", "whatsapp-poli-template-builder"]
    )

    # Definição das Tarefas Sequenciais (Workflow CrewAI)
    task1 = CrewTask(
        description="""Executar varredura de dados públicos via Apify buscando gestores de compras hospitalares,
        secretários de saúde e diretores de faturamento em municípios com mais de 50.000 habitantes.""",
        expected_output="Dataset JSON com 700 leads categorizados por porte de leitos, software legado em uso e e-mail/telefone verificado.",
        agent=lead_hunter
    )

    task2 = CrewTask(
        description="""Modelar a matriz de precificação em 3 camadas (Módulo Satélite Avulso R$ 1.900,
        Condomínio Clínico Standard R$ 6.800, Hospital 360 Enterprise R$ 14.500) ancorando a proposta
        na recuperação imediata de glosas TUSS e economia em compras pela tabela CMED/BPS.""",
        expected_output="Planilha de ROI demonstrando payback inferior a 30 dias para hospitais com mais de 30 leitos.",
        agent=pricing_strategist
    )

    task3 = CrewTask(
        description="""Redigir a régua de abordagem (e-mails 1 a 4 e mensagens de WhatsApp Poli)
        utilizando gatilhos de conformidade legal, auditoria e urgência regulatória sem termos genéricos.""",
        expected_output="Sequência completa de copy institucional pronta para disparo com testes A/B estruturados.",
        agent=copywriting_expert
    )

    crew_manifest = {
        "crew_name": "Hospital 360 Growth & Lead Generation Crew",
        "version": "1.0.0",
        "process": "sequential",
        "agents": [lead_hunter.to_dict(), pricing_strategist.to_dict(), copywriting_expert.to_dict()],
        "tasks": [task1.to_dict(), task2.to_dict(), task3.to_dict()]
    }

    return crew_manifest

if __name__ == "__main__":
    crew = build_hospital360_growth_crew()
    print(json.dumps(crew, indent=2, ensure_ascii=False))
