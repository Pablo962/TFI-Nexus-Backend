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
        const perfiles = await this.prisma.perfil.findMany({
          include: {
            habilidades: { include: { habilidad: true } },
            postulaciones: { include: { vacante: true } },
          },
        });

        if (perfiles.length > 0) {
          const mappedCandidates: Array<Candidate & { stage?: string }> = perfiles.map((p, idx) => {
            const postu = p.postulaciones[0];
            const techHabs = p.habilidades.filter((h) => h.habilidad.tipo === 'Técnica').map((h) => h.habilidad.nombre);
            const softHabs = p.habilidades.filter((h) => h.habilidad.tipo === 'Blanda').map((h) => h.habilidad.nombre);
            const score = postu?.ranking || 85 - idx * 5;

            // Enlazar con avatar e id conocido si coincide por nombre
            const memMatch = this.inMemoryCandidates.find(
              (m) => m.name.toLowerCase().includes(p.nombre.toLowerCase()) || m.id === String(p.id),
            );

            return {
              id: memMatch?.id || String(p.id),
              rank: idx + 1,
              name: `${p.nombre} ${p.apellido}`,
              title: p.descripcion || memMatch?.title || 'Especialista de Sistemas',
              experience: p.carrera ? `${p.carrera} (${p.anioCursado || 'Graduado'})` : memMatch?.experience || '4+ años',
              avatar: memMatch?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              matchScore: score,
              matchLabel: score >= 90 ? 'Excelente Match' : score >= 80 ? 'Perfil Sólido' : 'Potencial Formativo',
              techScore: +(score / 20).toFixed(1),
              softScore: 4.2,
              strengths: [techHabs.slice(0, 2).join(', '), softHabs[0]].filter(Boolean).join(' • ') || p.justificacion || 'Habilidades clave validadas',
              stage: memMatch?.stage || 'Revisión Inicial',
              radarScores: memMatch?.radarScores || {
                kubernetes: 4.2,
                zeroTrust: 4.0,
                commExec: 4.0,
                negotiation: 3.8,
                finOps: 3.9,
              },
            };
          });

          let result = mappedCandidates;
          if (query?.minMatch) {
            result = result.filter((c) => c.matchScore >= query.minMatch!);
          }
          result.sort((a, b) => b.matchScore - a.matchScore);
          return {
            total: result.length,
            data: result,
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
    const all = await this.findAll();
    const candidate = all.data.find((c) => c.id === id || String((c as any).rank) === id);
    if (candidate) {
      return candidate;
    }

    const mem = this.inMemoryCandidates.find((c) => c.id === id);
    if (!mem) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }
    return mem;
  }

  async updateStage(id: string, stage: string) {
    const candidate = await this.findOne(id);
    candidate.stage = stage;
    const memIdx = this.inMemoryCandidates.findIndex((c) => c.id === id);
    if (memIdx !== -1) {
      this.inMemoryCandidates[memIdx].stage = stage;
    }

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

  // Métodos específicos para las 6 tablas de Supabase
  async getVacantes() {
    if (this.prisma) {
      try {
        const vacantes = await this.prisma.vacante.findMany({
          include: {
            vacanteHabilidades: { include: { habilidad: true } },
            postulaciones: { include: { perfil: true } },
          },
        });
        if (vacantes.length > 0) return vacantes;
      } catch {
        // Continuar a fallback
      }
    }
    return [];
  }

  async getPerfiles() {
    if (this.prisma) {
      try {
        const perfiles = await this.prisma.perfil.findMany({
          include: {
            habilidades: { include: { habilidad: true } },
            postulaciones: { include: { vacante: true } },
          },
        });
        if (perfiles.length > 0) return perfiles;
      } catch {
        // Continuar a fallback
      }
    }
    return [];
  }

  async getHabilidades() {
    if (this.prisma) {
      try {
        const habs = await this.prisma.habilidad.findMany();
        if (habs.length > 0) return habs;
      } catch {
        // Continuar a fallback
      }
    }
    return [];
  }

  async getPostulaciones() {
    if (this.prisma) {
      try {
        const postus = await this.prisma.postulacion.findMany({
          include: {
            perfil: true,
            vacante: true,
          },
        });
        if (postus.length > 0) return postus;
      } catch {
        // Continuar a fallback
      }
    }
    return [];
  }
}
