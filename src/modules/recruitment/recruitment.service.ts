import { Injectable, NotFoundException } from '@nestjs/common';
import { CANDIDATES_DATA } from '../../data/seed-data.js';
import { Candidate } from '../../common/types.js';

@Injectable()
export class RecruitmentService {
  private candidates: Array<Candidate & { stage?: string }> = CANDIDATES_DATA.map((c) => ({
    ...c,
    stage: c.id === 'mateo' ? 'Oferta Final' : c.id === 'camila' ? 'Entrevista Técnica' : 'Validación Cultural',
  }));

  async findAll(query?: { jobCode?: string; minMatch?: number }) {
    let result = [...this.candidates];

    if (query?.minMatch) {
      result = result.filter((c) => c.matchScore >= query.minMatch!);
    }

    // Ordenar de mayor a menor coincidencia
    result.sort((a, b) => b.matchScore - a.matchScore);

    return {
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    const candidate = this.candidates.find((c) => c.id === id);
    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }
    return candidate;
  }

  async updateStage(id: string, stage: string) {
    const candidate = await this.findOne(id);
    candidate.stage = stage;
    return {
      message: `Candidato ${candidate.name} movido a la etapa "${stage}"`,
      candidate,
    };
  }

  async sendOffer(id: string, offerDetails?: { salary?: string; startDate?: string }) {
    const candidate = await this.findOne(id);
    candidate.stage = 'Oferta Enviada';

    return {
      message: `¡Listo! Oferta formal de empleo enviada exitosamente a ${candidate.name}.`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      stage: candidate.stage,
      salaryOffered: offerDetails?.salary || 'USD 8,500 / mes (Banda E7)',
      startDate: offerDetails?.startDate || '2026-11-01',
      status: 'SENT',
      emittedAt: new Date().toISOString(),
    };
  }
}
