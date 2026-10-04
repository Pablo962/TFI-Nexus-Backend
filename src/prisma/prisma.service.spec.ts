import { describe, it, expect, afterEach } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let service: PrismaService;

  afterEach(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
  });

  it('debe estar definido e inicializarse correctamente', () => {
    service = new PrismaService();
    expect(service).toBeDefined();
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$disconnect).toBe('function');
  });

  it('debe contener los 6 modelos del esquema de Prisma para Reclutamiento', () => {
    service = new PrismaService();
    expect(service.vacante).toBeDefined();
    expect(service.perfil).toBeDefined();
    expect(service.habilidad).toBeDefined();
    expect(service.postulacion).toBeDefined();
    expect(service.vacanteHabilidad).toBeDefined();
    expect(service.perfilHabilidad).toBeDefined();
  });
});
