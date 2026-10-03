import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationsService } from './evaluations.service.js';
import { ExportService } from '../export/export.service.js';

describe('EvaluationsService', () => {
  let service: EvaluationsService;
  let exportService: ExportService;

  beforeEach(() => {
    exportService = new ExportService();
    service = new EvaluationsService(exportService);
  });

  it('debe obtener la distribución de la matriz 9-box', async () => {
    const data = await service.get9BoxData();
    expect(data.totalEvaluated).toBeGreaterThan(0);
    expect(data.distribution['Talento Destacado (Estrella)'].length).toBeGreaterThan(0);
  });

  it('debe calibrar la calificación de un colaborador', async () => {
    const calibrated = await service.calibrate('eval-lucas', {
      calibratedScore: 4.9,
      box9: 'Talento Destacado (Estrella)',
      notes: 'Desempeño sobresaliente ratificado por comité',
    });

    expect(calibrated.evaluation.calibratedScore).toBe(4.9);
    expect(calibrated.evaluation.status).toBe('Calibrado');
  });

  it('debe exportar el acta de calibración 9-box en Excel y CSV', async () => {
    const excel = await service.export9Box('xlsx');
    expect(excel.buffer).toBeInstanceOf(Buffer);

    const csv = await service.export9Box('csv');
    expect(csv.buffer.toString()).toContain('Empleado,Puesto');
  });
});
