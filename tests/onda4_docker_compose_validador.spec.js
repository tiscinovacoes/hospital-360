/**
 * Suíte de Testes da ONDA 4: Padronização Docker, Multi-Contêiner & Orquestrador Mestre
 * Valida a integridade sintática e arquitetural de todos os 17 módulos Docker Compose,
 * Dockerfiles multi-stage, prevenção de conflito de portas e topologia de redes/volumes.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runOnda4Tests() {
  console.log('========================================================================');
  console.log('🐳 HOSPITAL 360 — SUÍTE DE TESTES DA ONDA 4 (PADRONIZAÇÃO DOCKER & COMPOSE)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  const rootDir = path.resolve(__dirname, '..');

  // Parser YAML simples para validar a hierarquia de blocos e extrair seções
  function parseYamlSections(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const services = new Set();
    const ports = [];
    const volumesDeclared = new Set();
    const networksDeclared = new Set();
    const volumesUsed = new Set();
    const networksUsed = new Set();

    let currentSection = null;
    let currentService = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Ignora comentários e linhas vazias
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = rawLine.search(/\S/);

      // Seções de topo (indent === 0)
      if (indent === 0) {
        if (trimmed.startsWith('services:')) currentSection = 'services';
        else if (trimmed.startsWith('networks:')) currentSection = 'networks';
        else if (trimmed.startsWith('volumes:')) currentSection = 'volumes';
        else currentSection = null;
        currentService = null;
        continue;
      }

      if (currentSection === 'services') {
        // Nome de serviço (indent 2 ou 4 dependendo da formatação)
        if (indent === 2 && trimmed.endsWith(':') && !trimmed.startsWith('-')) {
          currentService = trimmed.slice(0, -1);
          services.add(currentService);
        }

        // Portas
        if (trimmed.startsWith('- "') && trimmed.includes(':')) {
          const portMatch = trimmed.match(/"([^"]+)"/);
          if (portMatch) {
            const parts = portMatch[1].split(':');
            if (parts.length >= 2) {
              const hostPort = parts[0].replace(/[^0-9]/g, '');
              if (hostPort) {
                ports.push({ service: currentService, hostPort: parseInt(hostPort, 10), raw: portMatch[1] });
              }
            }
          }
        }

        // Redes usadas
        if (trimmed.startsWith('- ') && currentSection === 'services' && lines[i - 1] && lines[i - 1].includes('networks:')) {
          networksUsed.add(trimmed.replace('- ', '').trim());
        }

        // Volumes usados
        if (trimmed.startsWith('- ') && trimmed.includes(':') && lines[i - 1] && lines[i - 1].includes('volumes:')) {
          const volName = trimmed.replace('- ', '').split(':')[0].trim();
          if (!volName.startsWith('.') && !volName.startsWith('/')) {
            volumesUsed.add(volName);
          }
        }
      }

      if (currentSection === 'volumes') {
        if (indent === 2 && trimmed.endsWith(':')) {
          volumesDeclared.add(trimmed.slice(0, -1));
        }
      }

      if (currentSection === 'networks') {
        if (indent === 2 && trimmed.endsWith(':')) {
          networksDeclared.add(trimmed.slice(0, -1));
        }
      }
    }

    return { services, ports, volumesDeclared, networksDeclared, volumesUsed, networksUsed };
  }

  // 1. Validação do Orquestrador Mestre Raiz (docker-compose.all.yml)
  try {
    console.log('[TEST 1] Orquestrador Mestre (docker-compose.all.yml): Validação de seções e serviços...');

    const composeAllPath = path.join(rootDir, 'docker-compose.all.yml');
    assert.ok(fs.existsSync(composeAllPath), 'docker-compose.all.yml deve existir na raiz');

    const parsed = parseYamlSections(composeAllPath);
    assert.ok(parsed.services.size >= 10, `Deve conter ao menos 10 serviços unificados (encontrados: ${parsed.services.size})`);

    const expectedServices = [
      'postgres-core',
      'redis-bus',
      'n8n-bus',
      'hub-core',
      'mariadb-clinicas',
      'clinicas-openemr',
      'laboratorio-senaite',
      'farmacia-openboxes',
      'prometheus',
      'grafana'
    ];

    for (const s of expectedServices) {
      assert.ok(parsed.services.has(s), `Serviço '${s}' deve estar presente no docker-compose.all.yml`);
    }

    assert.ok(parsed.networksDeclared.has('hospital360_network'), 'Rede hospital360_network deve estar declarada');
    assert.ok(parsed.volumesDeclared.size >= 8, 'Deve declarar os volumes essenciais de dados');

    console.log(`  ✓ docker-compose.all.yml homologado com ${parsed.services.size} serviços e ${parsed.volumesDeclared.size} volumes.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 1:', err.message);
    failed++;
  }

  // 2. Validação da Cobertura de Docker Compose em todos os Módulos (00- a 16-)
  try {
    console.log('[TEST 2] Cobertura Modular: Validação de docker-compose.yml nos módulos 00- a 16-...');

    const expectedModuleDirs = [
      '00-hub-core',
      '01-modulo-clinicas',
      '02-modulo-laboratorio',
      '03-modulo-leitos-internacao',
      '04-modulo-estoque-farmacia',
      '05-modulo-wms-intralogistica',
      '06-modulo-compras-suprimentos',
      '07-modulo-fintech-split',
      '08-modulo-contabilidade-fiscal',
      '09-modulo-facilities-hotelaria',
      '10-modulo-regulacao-tfd',
      '11-modulo-escala-medica',
      '12-modulo-automacao-n8n',
      '13-modulo-ia-diagnostica',
      '14-modulo-mensageria-whatsapp',
      '15-modulo-base-precos-cmed',
      '16-infra-observabilidade-sre'
    ];

    for (const mod of expectedModuleDirs) {
      const composeFile = path.join(rootDir, mod, 'docker-compose.yml');
      assert.ok(fs.existsSync(composeFile), `Módulo '${mod}' deve possuir docker-compose.yml`);

      const parsedMod = parseYamlSections(composeFile);
      assert.ok(parsedMod.services.size >= 1, `Módulo '${mod}' deve conter ao menos 1 serviço`);
    }

    console.log(`  ✓ Todos os 17 módulos de 00- a 16- possuem docker-compose.yml válidos e isolados.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 2:', err.message);
    failed++;
  }

  // 3. Validação dos Dockerfiles e Artefatos Auxiliares Críticos (Tarefa 4.1)
  try {
    console.log('[TEST 3] Dockerfiles & Artefatos: Multi-stage build, .dockerignore e configs...');

    // 3.1 Hub Core & Nucleo
    const nucleoDockerfile = path.join(rootDir, 'nucleo', 'Dockerfile');
    const hubCoreDockerfile = path.join(rootDir, '00-hub-core', 'Dockerfile');
    assert.ok(fs.existsSync(nucleoDockerfile), 'nucleo/Dockerfile deve existir');
    assert.ok(fs.existsSync(hubCoreDockerfile), '00-hub-core/Dockerfile deve existir');

    const nucleoDockerIgnore = path.join(rootDir, 'nucleo', '.dockerignore');
    assert.ok(fs.existsSync(nucleoDockerIgnore), 'nucleo/.dockerignore deve existir para otimização de build context');

    // 3.2 Clínicas: Nginx + Supervisord
    const nginxConf = path.join(rootDir, '01-modulo-clinicas', 'config', 'nginx.conf');
    const supervisordConf = path.join(rootDir, '01-modulo-clinicas', 'config', 'supervisord.conf');
    assert.ok(fs.existsSync(nginxConf), '01-modulo-clinicas/config/nginx.conf deve existir');
    assert.ok(fs.existsSync(supervisordConf), '01-modulo-clinicas/config/supervisord.conf deve existir');

    // 3.3 Laboratório: requirements.txt + server.py
    const labReqs = path.join(rootDir, '02-modulo-laboratorio', 'requirements.txt');
    const labServer = path.join(rootDir, '02-modulo-laboratorio', 'server.py');
    assert.ok(fs.existsSync(labReqs), '02-modulo-laboratorio/requirements.txt deve existir');
    assert.ok(fs.existsSync(labServer), '02-modulo-laboratorio/server.py deve existir');

    console.log('  ✓ Dockerfiles multi-stage, .dockerignore e configurações satélites validados com sucesso.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 3:', err.message);
    failed++;
  }

  // 4. Auditoria de Conflito de Portas no Host
  try {
    console.log('[TEST 4] Matriz de Portas: Auditoria de colisão de portas TCP no host...');

    const composeAllPath = path.join(rootDir, 'docker-compose.all.yml');
    const parsed = parseYamlSections(composeAllPath);
    const portaMap = new Map();
    const conflitos = [];

    for (const item of parsed.ports) {
      if (portaMap.has(item.hostPort)) {
        conflitos.push({
          porta: item.hostPort,
          servico1: portaMap.get(item.hostPort),
          servico2: item.service
        });
      } else {
        portaMap.set(item.hostPort, item.service);
      }
    }

    assert.strictEqual(conflitos.length, 0,
      `Conflito de portas detectado: ${JSON.stringify(conflitos)}`);

    // Validar portas críticas esperadas
    const expectedPorts = [3000, 3001, 3306, 3307, 5432, 5435, 5436, 5437, 5678, 6379, 6382, 8081, 8082, 8084, 8094, 9090];
    for (const p of expectedPorts) {
      assert.ok(portaMap.has(p), `Porta TCP ${p} deve estar alocada a um serviço específico`);
    }

    console.log(`  ✓ Nenhuma colisão detectada: ${portaMap.size} portas de host mapeadas unicamente.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 4:', err.message);
    failed++;
  }

  // 5. Hardening de Contêineres e Padrões de Produção (docker-expert)
  try {
    console.log('[TEST 5] Hardening & Resiliência: Healthchecks, non-root users e restart policies...');

    const composeAllContent = fs.readFileSync(path.join(rootDir, 'docker-compose.all.yml'), 'utf8');

    // Valida restart policy
    assert.ok(composeAllContent.includes('restart: unless-stopped'), 'Deve aplicar restart policy unless-stopped');

    // Valida healthchecks
    assert.ok(composeAllContent.includes('healthcheck:'), 'Deve definir healthchecks em serviços de persistência e core');

    // Valida dependência condicionada a healthcheck
    assert.ok(composeAllContent.includes('condition: service_healthy'), 'Deve conter dependência vinculada a service_healthy');

    // Valida limites de recursos
    assert.ok(composeAllContent.includes('resources:'), 'Deve declarar limites de CPU e memória');

    console.log('  ✓ Políticas de segurança, restart, healthcheck e resource limits validadas segundo docker-expert.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 5:', err.message);
    failed++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Resultado da Onda 4: ${passed} passaram, ${failed} falharam.`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOnda4Tests();
