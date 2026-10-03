import { describe, it, expect, beforeEach } from 'vitest';
import { JobsService } from './jobs.service.js';
import { ExportService } from '../export/export.service.js';

describe('JobsService', () => {
  let service: JobsService;
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
    service = new JobsService(exportService);
  });

  it('debe listar puestos de trabajo y filtrar puestos críticos', async () => {
    const all = await service.findAll();
    expect(all.total).toBeGreaterThan(0);

    const critical = await service.findAll({ onlyCritical: true });
    expect(critical.data.every((j) => j.status === 'critical')).toBe(true);
  });

  it('debe exportar la matriz de puestos en Excel (Buffer) y CSV', async () => {
    const excel = await service.exportMatrix('xlsx');
    expect(excel.buffer).toBeInstanceOf(Buffer);
    expect(excel.contentType).toContain('spreadsheetml');

    const csv = await service.exportMatrix('csv');
    expect(csv.buffer.toString()).toContain('Código,Título del Cargo');
  });

  it('debe abrir una vacante para un puesto', async () => {
    const result = await service.openVacancy('PUE-2026-ARCH-03');
    expect(result.status).toBe('OPEN');
    expect(result.jobCode).toBe('PUE-2026-ARCH-03');
  });
});
