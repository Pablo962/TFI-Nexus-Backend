import { Injectable, NotFoundException } from '@nestjs/common';
import { INITIAL_EVALUATIONS } from '../../data/seed-data.js';
import { CalibrateDto } from './dto/calibrate.dto.js';
import { ExportService } from '../export/export.service.js';

@Injectable()
export class EvaluationsService {
  private evaluations = [...INITIAL_EVALUATIONS];

  constructor(private readonly exportService: ExportService) {}

  async findAll(query?: { status?: string }) {
    let result = [...this.evaluations];
    if (query?.status && query.status !== 'all') {
      result = result.filter((e) => e.status.toLowerCase() === query.status!.toLowerCase());
    }
    return {
      total: result.length,
      data: result,
    };
  }

  async get9BoxData() {
    const distribution = {
      'Talento Destacado (Estrella)': this.evaluations.filter((e) => e.box9.includes('Estrella')),
      'Alto Potencial': this.evaluations.filter((e) => e.box9 === 'Alto Potencial'),
      'Especialista Clave': this.evaluations.filter((e) => e.box9 === 'Especialista Clave'),
      'Desempeño Sólido': this.evaluations.filter((e) => e.box9 === 'Desempeño Sólido'),
      'En Desarrollo': this.evaluations.filter((e) => e.box9 === 'En Desarrollo'),
    };

    return {
      cycle: 'Ciclo Anual 2026 (Calibración Q4)',
      totalEvaluated: this.evaluations.length,
      distribution,
      evaluations: this.evaluations,
    };
  }

  async calibrate(id: string, calibrateDto: CalibrateDto) {
    const evaluation = this.evaluations.find((e) => e.id === id || e.employeeId === id);
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

  async export9Box(format: 'xlsx' | 'csv' = 'xlsx') {
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

    const data = this.evaluations.map((e) => ({
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
