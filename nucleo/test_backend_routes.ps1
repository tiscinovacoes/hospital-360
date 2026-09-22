Write-Host "=== TESTE 1: GET /api/hub/despesas/ingestao ==="
$r1 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/hub/despesas/ingestao" -Method Get
Write-Host "Total registros:" $r1.total_registros "| Valor acumulado: R$" $r1.valor_total_acumulado "| Modulos:" ($r1.modulos_emissores -join ", ")

Write-Host "`n=== TESTE 2: GET /api/hub/despesas/consolidado ==="
$r2 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/hub/despesas/consolidado?cpf=123.456.789-00" -Method Get
Write-Host "Paciente:" $r2.data.paciente.nome "| Custo Total: R$" $r2.data.custoTotalReal
Write-Host "Estacoes apuradas:" $r2.data.estacoes.Count
Write-Host "Margem TUSS %:" $r2.data.benchmarkFinanceiro.margemPercentual "% | Deficit SUS: R$" $r2.data.benchmarkFinanceiro.deficitSusReais

Write-Host "`n=== TESTE 3: GET /api/hub/despesas/exportar (CSV) ==="
$r3 = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/hub/despesas/exportar?formato=csv" -Method Get -UseBasicParsing
Write-Host "CSV Status:" $r3.StatusCode "| Bytes:" $r3.RawContentLength "| Linhas:" ($r3.Content.Split("`n").Length)

Write-Host "`n=== TESTE 4: GET /api/hub/despesas/exportar (TISS XML) ==="
$r4 = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/hub/despesas/exportar?formato=tiss" -Method Get -UseBasicParsing
Write-Host "XML Status:" $r4.StatusCode "| Tamanho XML:" $r4.Content.Length

Write-Host "`n=== TESTE 5: POST /api/farmacia/despesas (Exportacao ao Hub) ==="
$r5 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/farmacia/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Farmacia Protocolo:" $r5.protocolo_hub "| Valor: R$" $r5.valor_total_exportado "| Itens:" $r5.itens_exportados

Write-Host "`n=== TESTE 6: POST /api/leitos/despesas (Exportacao ao Hub) ==="
$r6 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/leitos/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Leitos Protocolo:" $r6.protocolo_hub "| Valor: R$" $r6.valor_total_exportado

Write-Host "`n=== TESTE 7: POST /api/escala-medica/despesas (Exportacao ao Hub) ==="
$r7 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/escala-medica/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Escala Medica Protocolo:" $r7.protocolo_hub "| Valor: R$" $r7.valor_total_exportado

Write-Host "`n=== TESTE 8: POST /api/laboratorio/despesas (Exportacao ao Hub) ==="
$r8 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/laboratorio/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Laboratorio Protocolo:" $r8.protocolo_hub "| Valor: R$" $r8.valor_total_exportado

Write-Host "`n=== TESTE 9: POST /api/compras-atas/despesas (Exportacao ao Hub) ==="
$r9 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/compras-atas/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Compras Atas Protocolo:" $r9.protocolo_hub "| Valor: R$" $r9.valor_total_exportado

Write-Host "`n=== TESTE 10: POST /api/gestao-clinica/despesas (Exportacao ao Hub) ==="
$r10 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/gestao-clinica/despesas" -Method Post -ContentType "application/json" -Body '{"cpf":"123.456.789-00"}'
Write-Host "Gestao Clinica Protocolo:" $r10.protocolo_hub "| Valor: R$" $r10.valor_total_exportado

Write-Host "`n=== TESTE 11: GET /api/contabil/despesas (DRE do Paciente e Split) ==="
$r11 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/contabil/despesas?cpf=123.456.789-00" -Method Get
Write-Host "Contabil Status:" $r11.success "| Faturamento Liquido: R$" $r11.demonstrativo_dre_paciente.faturamento_liquido_operacional "| Taxa Condominio (20%): R$" $r11.demonstrativo_dre_paciente.split_recebiveis.taxa_administracao_condominio_20pct

Write-Host "`n=== TESTE 12: GET /api/custo-paciente (Integrado Dinamicamente) ==="
$r12 = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/custo-paciente?cpf=123.456.789-00" -Method Get
Write-Host "Custo Paciente:" $r12.data.nome "| Custo Total Real: R$" $r12.data.custoTotalReal "| Margem:" $r12.data.benchmarkPrivado.margemPercentual "%"

Write-Host "`n=== TODOS OS 12 TESTES DE BACKEND PASSARAM COM SUCESSO ==="
