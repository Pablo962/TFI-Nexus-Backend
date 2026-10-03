import { describe, it, expect, beforeEach } from 'vitest';
import { PorterService } from './porter.service.js';

describe('PorterService', () => {
  let service: PorterService;

  beforeEach(() => {
    service = new PorterService();
  });

  it('debe listar todas las actividades de la cadena de valor', async () => {
    const res = await service.findAll();
    expect(res.total).toBe(5);
    expect(res.data[0].step).toBe('01');
  });

  it('debe simular el impacto operativo con aumento de headcount y presupuesto', async () => {
    const simulation = await service.simulate({
      activityId: 2,
      headcount: 38,
      budgetK: 120,
    });

    expect(simulation.simulatedHeadcount).toBe(38);
    expect(simulation.projectedOperatingMarginDelta).toBeDefined();
    expect(simulation.efficiencyStatus).toBe('Óptima');
  });
});
