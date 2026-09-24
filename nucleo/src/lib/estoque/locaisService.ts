// ============================================================================
// LocaisService: Rede de Saúde de Itaquiraí-MS (1 CAF Central + 9 UBS)
// ============================================================================

import { LocalEstoque, PerfilEstoque } from './types';

export const LOCAIS_ITAQUIRAI_SEED: LocalEstoque[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'CAF',
    nome: 'Farmácia Central (CAF) - Gerência de Saúde',
    cnes: '5540887',
    endereco: 'Rua Campo Grande, Centro - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'UBS Flademir Carnizella da Rosa',
    cnes: '2374358',
    endereco: 'Av. Industrial, Bairro Jardim Primavera - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF João Batista Gallina',
    cnes: '2676842',
    endereco: 'Rua Mato Grosso, Bairro Nova Itaquiraí - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Sul Bonito',
    cnes: '2558653',
    endereco: 'Assentamento Sul Bonito - Zona Rural, Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Santa Rosa',
    cnes: '2558637',
    endereco: 'Assentamento Santa Rosa - Zona Rural, Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000006',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Complexo Santo Antônio',
    cnes: '7009496',
    endereco: 'Assentamento Santo Antônio - Polo Agrícola, Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000007',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Itaquiraí',
    cnes: '2558645',
    endereco: 'Rua das Flores, Centro - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000008',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Primavera',
    cnes: '2597187',
    endereco: 'Bairro Primavera - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000009',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF Santo Antônio',
    cnes: '4649834',
    endereco: 'Estrada Rural Santo Antônio, Gleba A - Itaquiraí/MS',
    ativo: true
  },
  {
    id: '11111111-0000-0000-0000-000000000010',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    tipo: 'FARMACIA_UBS',
    nome: 'USF de Nova Esperança',
    cnes: '4886917',
    endereco: 'Comunidade Nova Esperança - Zona Rural, Itaquiraí/MS',
    ativo: true
  }
];

export class LocaisService {
  private static locais: Map<string, LocalEstoque> = new Map(
    LOCAIS_ITAQUIRAI_SEED.map(l => [l.id, l])
  );

  static listarLocais(): LocalEstoque[] {
    return Array.from(this.locais.values());
  }

  static obterLocalPorId(id: string): LocalEstoque | null {
    return this.locais.get(id) || null;
  }

  static obterCafCentral(): LocalEstoque {
    const caf = Array.from(this.locais.values()).find(l => l.tipo === 'CAF');
    if (!caf) return LOCAIS_ITAQUIRAI_SEED[0];
    return caf;
  }

  static listarFarmaciasUbs(): LocalEstoque[] {
    return Array.from(this.locais.values()).filter(l => l.tipo === 'FARMACIA_UBS');
  }

  /**
   * Checa se o usuário com o perfil tem permissão de visualizar/operar o local informado
   */
  static checarPermissaoLocal(
    perfil: PerfilEstoque,
    localUsuarioId: string | null,
    localAlvoId: string
  ): boolean {
    if (perfil === 'GESTOR_MUNICIPAL') return true;
    if (perfil === 'ESTOQUISTA_CAF' || perfil === 'CONFERENTE') {
      const localAlvo = this.obterLocalPorId(localAlvoId);
      // CAF opera na CAF e enxerga remessas/solicitações para UBS
      return localAlvo?.tipo === 'CAF' || true;
    }
    if (perfil === 'FARMACEUTICO_UBS') {
      return localUsuarioId === localAlvoId;
    }
    return false;
  }
}
