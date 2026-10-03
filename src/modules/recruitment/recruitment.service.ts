import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { CANDIDATES_DATA } from '../../data/seed-data.js';
import { Candidate } from '../../common/types.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RecruitmentService {
  private inMemoryCandidates: Array<Candidate & { stage?: string }> = CANDIDATES_DATA.map((c) => ({
    ...c,
    stage: c.id === 'mateo' ? 'Oferta Final' : c.id === 'camila' ? 'Entrevista Técnica' : 'Validación Cultural',
  }));

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  private toCandidate(c: any): Candidate & { stage?: string } {
    return {
      id: c.id,
      rank: c.rank,
      name: c.name,
      title: c.title,
      experience: c.experience,
      avatar: c.avatar,
      matchScore: c.matchScore,
      matchLabel: c.matchLabel,
      techScore: c.techScore,
      softScore: c.softScore,
      strengths: c.strengths,
      stage: c.stage || 'Revisión Inicial',
      radarScores: c.radarScores || {
        kubernetes: 4.5,
        zeroTrust: 4.5,
        commExec: 4.0,
        negotiation: 4.0,
        finOps: 4.0,
      },
    };
  }

  async findAll(query?: { jobCode?: string; minMatch?: number }) {
    if (this.prisma) {
      try {
        const where: any = {};
        if (query?.minMatch) {
          where.matchScore = { gte: query.minMatch };
        }

        const candidates = await this.prisma.candidate.findMany({
          where,
          orderBy: { matchScore: 'desc' },
        });

        if (candidates.length > 0 || query?.minMatch) {
          return {
            total: candidates.length,
            data: candidates.map((c) => this.toCandidate(c)),
          };
        }
      } catch {
        // Fallback a memoria
      }
    }

    let result = [...this.inMemoryCandidates];

    if (query?.minMatch) {
      result = result.filter((c) => c.matchScore >= query.minMatch!);
    }

    result.sort((a, b) => b.matchScore - a.matchScore);

    return {
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    if (this.prisma) {
      try {
        const candidate = await this.prisma.candidate.findUnique({
          where: { id },
        });
        if (candidate) {
          return this.toCandidate(candidate);
        }
      } catch {
        // Fallback a memoria
      }
    }

    const candidate = this.inMemoryCandidates.find((c) => c.id === id);
    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }
    return candidate;
  }

  async updateStage(id: string, stage: string) {
    if (this.prisma) {
      try {
        const updated = await this.prisma.candidate.update({
          where: { id },
          data: { stage },
        });
        return {
          message: `Candidato ${updated.name} movido a la etapa "${stage}"`,
          candidate: this.toCandidate(updated),
        };
      } catch {
        // Fallback a memoria
      }
    }

    const candidate = await this.findOne(id);
    candidate.stage = stage;
    return {
      message: `Candidato ${candidate.name} movido a la etapa "${stage}"`,
      candidate,
    };
  }

  async sendOffer(id: string, offerDetails?: { salary?: string; startDate?: string }) {
    if (this.prisma) {
      try {
        const updated = await this.prisma.candidate.update({
          where: { id },
          data: { stage: 'Oferta Enviada' },
        });
        return {
          message: `¡Listo! Oferta formal de empleo enviada exitosamente a ${updated.name}.`,
          candidateId: updated.id,
          candidateName: updated.name,
          stage: updated.stage,
          salaryOffered: offerDetails?.salary || 'USD 8,500 / mes (Banda E7)',
          startDate: offerDetails?.startDate || '2026-11-01',
          status: 'SENT',
          emittedAt: new Date().toISOString(),
        };
      } catch {
        // Fallback a memoria
      }
    }

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
