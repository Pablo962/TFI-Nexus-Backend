import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { INITIAL_EVALUATIONS } from '../../data/seed-data.js';
import { CalibrateDto } from './dto/calibrate.dto.js';
import { ExportService } from '../export/export.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class EvaluationsService {
  private inMemoryEvaluations = [...INITIAL_EVALUATIONS];

  constructor(
    private readonly exportService: ExportService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async findAll(query?: { status?: string }) {
    if (this.prisma) {
      try {
        const where: any = {};
        if (query?.status && query.status !== 'all') {
          where.status = { equals: query.status, mode: 'insensitive' };
        }

        const evaluations = await this.prisma.evaluation.findMany({ where });
        if (evaluations.length > 0 || query?.status) {
          return {
            total: evaluations.length,
            data: evaluations,
          };
        }
      } catch {
        // Fallback a memoria
      }
    }

    let result = [...this.inMemoryEvaluations];
    if (query?.status && query.status !== 'all') {
      result = result.filter((e) => e.status.toLowerCase() === query.status!.toLowerCase());
    }
    return {
      total: result.length,
      data: result,
    };
  }

  async get9BoxData() {
    let evaluationsList: any[] = [];

    if (this.prisma) {
      try {
        evaluationsList = await this.prisma.evaluation.findMany();
      } catch {
        evaluationsList = [];
      }
    }

    if (evaluationsList.length === 0) {
      evaluationsList = [...this.inMemoryEvaluations];
    }

    const distribution = {
      'Talento Destacado (Estrella)': evaluationsList.filter((e) => e.box9.includes('Estrella')),
      'Alto Potencial': evaluationsList.filter((e) => e.box9 === 'Alto Potencial'),
      'Especialista Clave': evaluationsList.filter((e) => e.box9 === 'Especialista Clave'),
      'Desempeño Sólido': evaluationsList.filter((e) => e.box9 === 'Desempeño Sólido'),
      'En Desarrollo': evaluationsList.filter((e) => e.box9 === 'En Desarrollo'),
    };

    return {
      cycle: 'Ciclo Anual 2026 (Calibración Q4)',
      totalEvaluated: evaluationsList.length,
      distribution,
      evaluations: evaluationsList,
    };
  }

  async calibrate(id: string, calibrateDto: CalibrateDto) {
    if (this.prisma) {
      try {
        const existing = await this.prisma.evaluation.findFirst({
          where: {
            OR: [{ id }, { employeeId: id }],
          },
        });

        if (existing) {
          const updated = await this.prisma.evaluation.update({
            where: { id: existing.id },
            data: {
              calibratedScore: calibrateDto.calibratedScore,
              box9: calibrateDto.box9,
              status: 'Calibrado',
              gapAnalysis: `${existing.gapAnalysis} [Comité: ${calibrateDto.notes}]`,
            },
          });
          return {
            message: `Evaluación de ${updated.employeeName} calibrada exitosamente.`,
            evaluation: updated,
          };
        }
      } catch {
        // Fallback a memoria
      }
    }

    const evaluation = this.inMemoryEvaluations.find((e) => e.id === id || e.employeeId === id);
    if (!evaluation) {
      throw new NotFoundException(`Registro de evaluación ${id} no encontrado`);
    }

    evaluation.calibratedScore = calibrateDto.calibratedScore;
    evaluation.box9 = calibrateDto.box9;
    evaluation.status = 'Calibrado';
    evaluation.gapAnalysis = `${evaluation.gapAnalysis} [Comité: ${calibrateDto.notes}]`;

    return {
      message: `Evaluación de ${evaluation.employeeName} calibrada exitosamente.`,
      evaluation,
    };
  }

  async export9Box(format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') {
    const boxData = await this.get9BoxData();
    const evaluations = boxData.evaluations;

    if (format === 'pdf') {
      const rows = evaluations.map((e) => ({
        label: `${e.employeeName} (${e.role} - ${e.area})`,
        value: `9-Box: ${e.box9} | Calibrado: ${e.calibratedScore} | Estado: ${e.status}`,
      }));
      const buffer = await this.exportService.generatePdf(
        'Acta Oficial del Comité de Calibración de Talento 9-Box',
        'Consolidado de potencial de liderazgo vs. desempeño individual evaluado',
        rows,
      );
      return {
        buffer,
        contentType: 'application/pdf',
        filename: `Acta_9Box_Calibracion_NEXUS_${Date.now()}.pdf`,
      };
    }

    const columns = [
      { header: 'Empleado', key: 'employeeName', width: 30 },
      { header: 'Puesto', key: 'role', width: 35 },
      { header: 'Área', key: 'area', width: 30 },
      { header: 'Autoevaluación', key: 'selfScore', width: 15 },
      { header: 'Líder', key: 'managerScore', width: 15 },
      { header: 'Pares', key: 'peersScore', width: 15 },
      { header: 'Nota Calibrada', key: 'calibratedScore', width: 18 },
      { header: 'Cuadrante 9-Box', key: 'box9', width: 28 },
      { header: 'Estado', key: 'status', width: 18 },
    ];

    const data = evaluations.map((e) => ({
      employeeName: e.employeeName,
      role: e.role,
      area: e.area,
      selfScore: e.selfScore,
      managerScore: e.managerScore,
      peersScore: e.peersScore,
      calibratedScore: e.calibratedScore,
      box9: e.box9,
      status: e.status,
    }));

    if (format === 'csv') {
      const csvColumns = columns.map((c) => c.header);
      const csvRows = data.map((d) => [
        d.employeeName,
        d.role,
        d.area,
        d.selfScore,
        d.managerScore,
        d.peersScore,
        d.calibratedScore,
        d.box9,
        d.status,
      ]);
      return {
        buffer: Buffer.from(this.exportService.generateCsv(csvColumns, csvRows)),
        contentType: 'text/csv',
        filename: `Acta_9Box_Calibracion_NEXUS_${Date.now()}.csv`,
      };
    }

    const buffer = await this.exportService.generateExcel('Acta 9-Box', columns, data);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Acta_9Box_Calibracion_NEXUS_${Date.now()}.xlsx`,
    };
  }
}
