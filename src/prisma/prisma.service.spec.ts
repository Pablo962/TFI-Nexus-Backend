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

  it('debe contener los modelos del esquema de Prisma', () => {
    service = new PrismaService();
    expect(service.user).toBeDefined();
    expect(service.employee).toBeDefined();
    expect(service.candidate).toBeDefined();
    expect(service.jobPosition).toBeDefined();
    expect(service.evaluation).toBeDefined();
    expect(service.unidad).toBeDefined();
    expect(service.funcion).toBeDefined();
    expect(service.tarea).toBeDefined();
    expect(service.perfil).toBeDefined();
    expect(service.competencia).toBeDefined();
    expect(service.perfilCompetencia).toBeDefined();
    expect(service.responsabilidad).toBeDefined();
    expect(service.condicionTrabajo).toBeDefined();
    expect(service.riesgoPuesto).toBeDefined();
    expect(service.relacionPuesto).toBeDefined();
    expect(service.estandarDesempeno).toBeDefined();
    expect(service.learningTrack).toBeDefined();
    expect(service.porterActivity).toBeDefined();
    expect(service.vacante).toBeDefined();
    expect(service.postulante).toBeDefined();
    expect(service.habilidad).toBeDefined();
    expect(service.postulacion).toBeDefined();
    expect(service.vacanteHabilidad).toBeDefined();
    expect(service.perfilHabilidad).toBeDefined();
  });
});
