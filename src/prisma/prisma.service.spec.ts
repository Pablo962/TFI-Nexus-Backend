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

  it('debe contener los 12 modelos del esquema de Prisma (Opción A)', () => {
    service = new PrismaService();
    // 6 modelos de Talento y Organización
    expect(service.user).toBeDefined();
    expect(service.jobPosition).toBeDefined();
    expect(service.employee).toBeDefined();
    expect(service.evaluation).toBeDefined();
    expect(service.learningTrack).toBeDefined();
    expect(service.porterActivity).toBeDefined();

    // 6 modelos de Reclutamiento y Selección
    expect(service.vacante).toBeDefined();
    expect(service.perfil).toBeDefined();
    expect(service.habilidad).toBeDefined();
    expect(service.postulacion).toBeDefined();
    expect(service.vacanteHabilidad).toBeDefined();
    expect(service.perfilHabilidad).toBeDefined();
  });
});
