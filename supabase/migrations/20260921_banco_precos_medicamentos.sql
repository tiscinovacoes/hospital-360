-- =====================================================================
-- HOSPITAL 360 - BANCO OFICIAL DE PREÇOS DE MEDICAMENTOS
-- CMED (Preço Teto / PMVG) | BPS (Mediana SUS) | CATMAT (Padronização)
-- Tabela exposta no schema public (acessível via PostgREST/Supabase)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.banco_precos_medicamentos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_catmat VARCHAR(30) UNIQUE NOT NULL,
    nome_comercial_padrao VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255) NOT NULL,
    concentracao VARCHAR(100),
    forma_farmaceutica VARCHAR(100),
    apresentacao VARCHAR(150),
    unidade_fornecimento VARCHAR(50) NOT NULL,
    preco_teto_cmed NUMERIC(12, 4) NOT NULL,       -- Preço Máximo de Venda ao Governo (PMVG)
    preco_referencia_bps NUMERIC(12, 4) NOT NULL,   -- Mediana de Compras Públicas (Banco de Preços em Saúde)
    classe_terapeutica VARCHAR(150),
    tarja VARCHAR(30) DEFAULT 'VERMELHA',
    temperatura_exigida VARCHAR(120),
    data_atualizacao TIMESTAMPTZ DEFAULT now(),
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca ultrarrápida
CREATE INDEX IF NOT EXISTS idx_bpm_catmat ON public.banco_precos_medicamentos(codigo_catmat);
CREATE INDEX IF NOT EXISTS idx_bpm_principio ON public.banco_precos_medicamentos(principio_ativo);
CREATE INDEX IF NOT EXISTS idx_bpm_nome ON public.banco_precos_medicamentos(nome_comercial_padrao);

-- Habilitar RLS e permitir leitura pública e autenticada
ALTER TABLE public.banco_precos_medicamentos ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banco_precos_medicamentos' 
        AND policyname = 'Permitir leitura publica de precos medicamentos'
    ) THEN
        CREATE POLICY "Permitir leitura publica de precos medicamentos"
            ON public.banco_precos_medicamentos
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- Carga Inicial de Medicamentos Hospitalares Essenciais
INSERT INTO public.banco_precos_medicamentos (
    id, codigo_catmat, nome_comercial_padrao, principio_ativo, concentracao, 
    forma_farmaceutica, apresentacao, unidade_fornecimento, preco_teto_cmed, 
    preco_referencia_bps, classe_terapeutica, tarja, temperatura_exigida
) VALUES
('med-001', 'BR0284729', 'Meropenem 1g Pó Liofilizado Injetável', 'Meropenem Tri-hidratado', '1g', 'Pó para Solução Injetável', 'Frasco-Ampola', 'Frasco-Ampola', 68.2000, 52.1000, 'Antibiótico Carbapenêmico', 'VERMELHA', '15ºC a 30ºC (Ambiente Controlado)'),
('med-002', 'BR0194851', 'Noradrenalina 2mg/mL Ampola 4mL', 'Hemitartarato de Norepinefrina', '2mg/mL', 'Solução Injetável', 'Ampola 4mL', 'Ampola', 18.5000, 14.2000, 'Vasopressor / Vasoconstritor', 'VERMELHA', '2ºC a 8ºC (Cadeia de Frio Termolábil)'),
('med-003', 'BR0311209', 'Fentanila 0,05mg/mL Injetável 10mL', 'Citrato de Fentanila', '0,05mg/mL', 'Solução Injetável', 'Ampola 10mL', 'Ampola', 22.4000, 17.5000, 'Analgésico Opióide / Anestésico (Portaria 344/98)', 'PRETA', '15ºC a 30ºC (Ambiente Controlado)'),
('med-004', 'BR0355102', 'Enoxaparina Sódica 40mg/0,4mL Seringa', 'Enoxaparina Sódica', '40mg/0,4mL', 'Solução Injetável Subcutânea', 'Seringa Preenchida com Sistema de Segurança', 'Seringa Preenchida', 34.0000, 25.8000, 'Anticoagulante (Heparina Baixo Peso Molecular)', 'VERMELHA', '15ºC a 25ºC'),
('med-005', 'BR0401928', 'Imunoglobulina Humana 5g Frasco 100mL', 'Imunoglobulina Humana Endovenosa', '5g / 100mL (5%)', 'Solução para Infusão Endovenosa', 'Frasco de Vidro 100mL', 'Frasco', 1580.0000, 1320.0000, 'Hemoderivado Imunobiológico de Alto Custo', 'VERMELHA', '2ºC a 8ºC (Cadeia de Frio Rigorosa)'),
('med-006', 'BR0001003', 'Dipirona Sódica 500mg/mL Ampola 2mL', 'Dipirona Monoidratada', '500mg/mL', 'Solução Injetável', 'Ampola 2mL', 'Ampola', 3.2000, 1.8500, 'Analgésico e Antipirético', 'VERMELHA', '15ºC a 30ºC'),
('med-007', 'BR0291180', 'Cloridrato de Dobutamina 12,5mg/mL 20mL', 'Cloridrato de Dobutamina', '12,5mg/mL (250mg)', 'Solução Injetável para Infusão', 'Ampola 20mL', 'Ampola', 29.8000, 23.4000, 'Inotrópico Positivo Cardíaco', 'VERMELHA', '15ºC a 30ºC'),
('med-008', 'BR0319802', 'Levofloxacino 5mg/mL Bolsa 100mL', 'Levofloxacino Hemirridratado', '500mg/100mL', 'Solução para Infusão IV', 'Bolsa Plástica com Sistema Fechado 100mL', 'Bolsa', 22.0000, 16.5000, 'Antibiótico Fluoroquinolona', 'VERMELHA', '15ºC a 30ºC'),
('med-009', 'BR0348911', 'Albumina Humana 20% Frasco 50mL', 'Albumina Humana', '20% (10g)', 'Solução Coloidal Injetável', 'Frasco-Ampola 50mL', 'Frasco', 340.0000, 285.0000, 'Expansor Plasmático / Hemoderivado', 'VERMELHA', '2ºC a 25ºC'),
('med-010', 'BR0284102', 'Sulfato de Atropina 0,5mg/mL Ampola 1mL', 'Sulfato de Atropina', '0,5mg/mL', 'Solução Injetável', 'Ampola 1mL', 'Ampola', 2.9000, 1.8500, 'Anticolinérgico / Parassimpaticolítico', 'VERMELHA', '15ºC a 30ºC'),
('med-011', 'BR0351299', 'Acetato de Caspofungina 50mg Frasco', 'Acetato de Caspofungina', '50mg', 'Pó Liofilizado Injetável', 'Frasco-Ampola', 'Frasco', 490.0000, 420.0000, 'Antifúngico Equinocandina', 'VERMELHA', '2ºC a 8ºC (Cadeia de Frio)'),
('med-012', 'BR0298411', 'Cloridrato de Midazolam 5mg/mL Ampola 3mL', 'Cloridrato de Midazolam', '5mg/mL (15mg)', 'Solução Injetável', 'Ampola 3mL', 'Ampola', 7.8000, 4.9000, 'Sedativo / Benzodiazepínico (Portaria 344/98)', 'PRETA', '15ºC a 30ºC'),
('med-013', 'BR0301192', 'Propofol 10mg/mL Emulsão Ampola 20mL', 'Propofol', '10mg/mL (200mg/20mL)', 'Emulsão Injetável Lipídica', 'Ampola 20mL', 'Ampola', 24.5000, 16.9000, 'Anestésico Geral Hipnótico', 'VERMELHA', '2ºC a 25ºC (Não congelar)'),
('med-014', 'BR0275810', 'Cloridrato de Vancomicina 500mg Frasco', 'Cloridrato de Vancomicina', '500mg', 'Pó Liofilizado Injetável', 'Frasco-Ampola', 'Frasco', 28.9000, 19.4000, 'Antibiótico Glicopeptídeo', 'VERMELHA', '15ºC a 30ºC'),
('med-015', 'BR0289123', 'Ceftriaxona Sódica 1g Frasco-Ampola', 'Ceftriaxona Dissódica', '1g', 'Pó para Injeção IV', 'Frasco-Ampola com Diluente', 'Frasco-Ampola', 26.5000, 18.2000, 'Antibiótico Cefalosporina 3ª Geração', 'VERMELHA', '15ºC a 30ºC')
ON CONFLICT (codigo_catmat) DO UPDATE SET
    nome_comercial_padrao = EXCLUDED.nome_comercial_padrao,
    principio_ativo = EXCLUDED.principio_ativo,
    concentracao = EXCLUDED.concentracao,
    forma_farmaceutica = EXCLUDED.forma_farmaceutica,
    apresentacao = EXCLUDED.apresentacao,
    unidade_fornecimento = EXCLUDED.unidade_fornecimento,
    preco_teto_cmed = EXCLUDED.preco_teto_cmed,
    preco_referencia_bps = EXCLUDED.preco_referencia_bps,
    classe_terapeutica = EXCLUDED.classe_terapeutica,
    tarja = EXCLUDED.tarja,
    temperatura_exigida = EXCLUDED.temperatura_exigida,
    data_atualizacao = now();
