import { describe, it, expect, beforeEach } from 'vitest';
import { ReportsService } from './reports.service.js';
import { ExportService } from '../export/export.service.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
    service = new ReportsService(exportService);
  });

  it('debe devolver los KPIs del dashboard ejecutivo', () => {
    const kpis = service.getDashboardKpis('Q4 2026');
    expect(kpis.overallEffectiveness).toBe('94.8%');
    expect(kpis.criticalRolesCovered).toBe('92.4%');
  });

  it('debe devolver el inventario de competencias con etiquetas legibles', () => {
    const inventory = service.getSkillsInventory();
    expect(inventory.totalCompetencies).toBeGreaterThan(0);
    expect(inventory.data[0].label).toBeDefined();
    expect(inventory.data[0].demand).toBeDefined();
  });

  it('debe exportar los reportes en Excel y CSV', async () => {
    const excel = await service.exportReport('xlsx');
    expect(excel.buffer).toBeInstanceOf(Buffer);

    const csv = await service.exportReport('csv');
    expect(csv.buffer.toString()).toContain('Equipo / Squad');
  });
});
