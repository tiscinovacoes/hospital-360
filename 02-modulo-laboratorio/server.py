"""
Hospital 360 — Módulo Laboratório & SENAITE LIMS REST Gateway
Porta: 8082
"""
import http.server
import json
import os
import sys

CATALOGO_LOINC = [
    {
        "codigo_loinc": "57021-8",
        "nome_exame": "Hemograma Completo com Contagem de Plaquetas",
        "categoria": "HEMATOLOGIA",
        "prazo_bancada_minutos": 25,
        "custo_reagentes_base": 8.50,
        "custo_descartaveis_base": 3.20,
        "unidade_medida": "MIL/MM3",
        "valores_referencia": {"min": 4.0, "max": 10.0, "unidade": "mil/mm3"}
    },
    {
        "codigo_loinc": "49563-0",
        "nome_exame": "Troponina I de Alta Sensibilidade",
        "categoria": "IMUNOENSAIO",
        "prazo_bancada_minutos": 15,
        "custo_reagentes_base": 32.00,
        "custo_descartaveis_base": 5.50,
        "unidade_medida": "NG/L",
        "valores_referencia": {"min": 0.0, "max": 14.0, "unidade": "ng/L"}
    },
    {
        "codigo_loinc": "24331-1",
        "nome_exame": "Lipidograma Completo (Colesterol Total, HDL, LDL, VLDL)",
        "categoria": "BIOQUIMICA",
        "prazo_bancada_minutos": 30,
        "custo_reagentes_base": 14.00,
        "custo_descartaveis_base": 4.00,
        "unidade_medida": "MG/DL",
        "valores_referencia": {"min": 0.0, "max": 190.0, "unidade": "mg/dL"}
    }
]

class SenaiteGatewayHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        if self.path in ['/health', '/api/health']:
            self._send_json(200, {
                "status": "healthy",
                "service": "SENAITE LIMS Gateway",
                "module": "02-modulo-laboratorio",
                "version": "2.5.0"
            })
        elif self.path in ['/api/senaite/catalogo', '/catalogo']:
            self._send_json(200, {
                "success": True,
                "total": len(CATALOGO_LOINC),
                "itens": CATALOGO_LOINC
            })
        else:
            self._send_json(404, {"error": "Rota não encontrada"})

    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len).decode('utf-8') if content_len > 0 else '{}'
        try:
            payload = json.loads(post_body)
        except Exception:
            payload = {}

        if self.path in ['/api/senaite/workorder', '/workorder']:
            workorder_id = f"WO-SEN-{payload.get('paciente_cpf', '000')[:3]}-{len(post_body)}"
            self._send_json(201, {
                "success": True,
                "workorder_id": workorder_id,
                "status": "EM_PROCESSAMENTO_BANCADA",
                "exames_solicitados": payload.get('exames', []),
                "mensagem": "Ordem de serviço cadastrada no SENAITE LIMS com sucesso."
            })
        elif self.path in ['/api/senaite/laudo', '/laudo']:
            self._send_json(200, {
                "success": True,
                "laudo_id": f"LAU-SEN-{payload.get('workorder_id', '999')}",
                "status": "LIBERADO_BIOMEDICO",
                "pdf_url": f"/laudos/laudo_{payload.get('workorder_id', 'default')}.pdf"
            })
        else:
            self._send_json(404, {"error": "Endpoint POST desconhecido"})

def run(port=8082):
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, SenaiteGatewayHandler)
    print(f"🔬 SENAITE LIMS Gateway rodando na porta {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8082))
    run(port)
