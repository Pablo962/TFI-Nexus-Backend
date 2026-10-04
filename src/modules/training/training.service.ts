import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { INITIAL_TRACKS } from '../../data/seed-data.js';
import { EnrollDto } from './dto/enroll.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TrainingService {
  private inMemoryTracks = [...INITIAL_TRACKS];

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async findAll(query?: { category?: string }) {
    if (this.prisma) {
      try {
        const where: any = {};
        if (query?.category && query.category !== 'all') {
          where.category = { contains: query.category, mode: 'insensitive' };
        }

        const tracks = await this.prisma.learningTrack.findMany({ where });
        if (tracks.length > 0 || query?.category) {
          return {
            total: tracks.length,
            data: tracks,
          };
        }
      } catch {
        // Fallback a memoria
      }
    }

    let result = [...this.inMemoryTracks];
    if (query?.category && query.category !== 'all') {
      result = result.filter((t) => t.category.toLowerCase().includes(query.category!.toLowerCase()));
    }
    return {
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    if (this.prisma) {
      try {
        const track = await this.prisma.learningTrack.findUnique({
          where: { id },
        });
        if (track) {
          return track;
        }
      } catch {
        // Fallback a memoria
      }
    }

    const track = this.inMemoryTracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }
    return track;
  }

  async enroll(enrollDto: EnrollDto) {
    const track = await this.findOne(enrollDto.trackId);
    const existing = (track.enrolledEmployees as any[]).find((e) => e.name === enrollDto.employeeName);

    if (existing) {
      return {
        message: `${enrollDto.employeeName} ya se encuentra inscripto en este curso.`,
        track,
      };
    }

    (track.enrolledEmployees as any[]).push({
      name: enrollDto.employeeName,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      progress: 0,
    });
    track.enrolledCount += 1;

    return {
      message: `¡Inscripción exitosa! Plan formativo asignado a ${enrollDto.employeeName}`,
      track,
    };
  }
}
