import { describe, it, expect, beforeEach } from 'vitest';
import { RecruitmentService } from './recruitment.service.js';

describe('RecruitmentService', () => {
  let service: RecruitmentService;

  beforeEach(() => {
    service = new RecruitmentService();
  });

  it('debe listar candidatos ordenados por match score descendente', async () => {
    const res = await service.findAll();
    expect(res.total).toBeGreaterThan(0);
    expect(res.data[0].matchScore).toBeGreaterThanOrEqual(res.data[1].matchScore);
  });

  it('debe actualizar la etapa del pipeline de un candidato', async () => {
    const updated = await service.updateStage('mateo', 'Oferta Final');
    expect(updated.candidate.stage).toBe('Oferta Final');
  });

  it('debe emitir oferta formal a un candidato', async () => {
    const offer = await service.sendOffer('mateo');
    expect(offer.status).toBe('SENT');
    expect(offer.stage).toBe('Oferta Enviada');
  });
});
