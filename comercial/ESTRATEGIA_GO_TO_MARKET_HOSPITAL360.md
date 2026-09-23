# ESTRATÉGIA DE GO-TO-MARKET & PROSPECÇÃO (HOSPITAL 360)
> **Baseada em Economia Comportamental, Psicologia de Preços & Automação Apify**  
> **Autores:** Squad Comercial & Esquadrão CrewAI  
> **Data:** 22 de Setembro de 2026  

---

## 1. O Posicionamento: Fuga do "SaaS Genérico"

A maioria dos softwares de saúde falha comercialmente por se posicionar como um "ERP médico em nuvem inovador". Diretores hospitalares e secretários municipais de saúde já possuem sistemas legados (MV, Tasy, Philips) e são avessos ao risco de migração.

O **Hospital 360** não entra competindo com o prontuário em si: ele entra como uma **Blindagem de Custeio e Estancamento Imediato de Perdas**:
1. **Auditoria de Compras Públicas:** Trava automática de sobrepreço CMED/BPS (Lei 14.133/21).
2. **Farmácia & Almoxarifado:** Baixa FEFO com bloqueio sanitário de lotes vencidos pela Anvisa.
3. **Fintech Médica:** Split tripartite bancário sem bitributação de pessoa física/jurídica.
4. **Governança de Leitos:** Giro ágil com chamado automático de higienização Facilities.

---

## 2. Estrutura de Precificação Psicológica (Decoy Effect)

Utilizamos a teoria da escolha assimétrica para conduzir o tomador de decisão ao plano alvo com alta percepção de valor:

| Plano | Preço Mensal | Escopo Entregue | Papel Psicológico |
| :--- | :--- | :--- | :--- |
| **Módulo Satélite Avulso** | **R$ 1.900/mês** | Apenas 1 módulo isolado (ex: só FEFO ou só Escala Médica) | **O Chamariz Inferior:** Mostra que comprar pedaços separados é ineficiente e caro. |
| **Condomínio Clínico Standard** | **R$ 6.800/mês** | Recepção, Split Hyperswitch, Censo de Leitos e Facilities | **A Opção Racional Média:** Ideal para policlínicas e prédios médicos. |
| **Hospital 360 Enterprise Full** | **R$ 14.500/mês** | Todas as 5 Estações Door-to-Door, CMED/BPS, LIS, Hub de Despesas e SRE | **O Plano Alvo:** Apenas R$ 7.700 a mais que o Standard, entregando automação completa. |

### Ancoragem de Retorno sobre Investimento (ROI):
- Um hospital de 60 leitos gasta em média **R$ 210.000/mês** com desperdícios de materiais cirúrgicos e glosas de faturamento.
- O plano Enterprise custa **R$ 14.500/mês**. 
- Bastam **7% de redução no desperdício** no primeiro mês para que o sistema se pague integralmente (Payback em < 30 dias).

---

## 3. Cadência de Cold Outreach (WhatsApp Poli & E-mail Institucional)

### Mensagem 1 (Abordagem Direta de Conformidade):
> **Assunto:** [Atenção Faturamento/Compras] Auditoria de Conformidade com Teto CMED e Lei 14.133/21  
> **Corpo:**  
> "Prezado Dr. [Nome do Diretor],  
> Com o endurecimento da fiscalização da Lei 14.133/21 e os tetos PMVG da Anvisa, a aquisição de antibióticos e hemoderivados tem gerado apontamentos recorrentes em auditorias de saúde.  
> O Hospital 360 opera como uma camada de validação em tempo real: ele impede que qualquer ordem de compra seja emitida acima da mediana do BPS ou do teto CMED, além de rastrear o custo real do paciente da triagem à alta.  
> Podemos apresentar uma demonstração de 15 minutos comparando os últimos 10 itens adquiridos pela sua instituição com a tabela oficial?"

---

## 4. Pipeline de Raspagem Apify (Lead Generation)

O script `agentes/hospital360_growth_crew.py` orquestra a coleta de dados públicos através de 3 atores Apify:
- **Apify CNES Scraper:** Mapeia hospitais por número de leitos cirúrgicos e UTI.
- **Apify Transparência Saúde:** Filtra municípios com pregões de medicamentos abertos.
- **LinkedIn Executive Crawler:** Identifica Diretores Técnicos (CRM ativo) e Gestores de Suprimentos.
