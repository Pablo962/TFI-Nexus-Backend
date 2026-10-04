import { Injectable, NotFoundException } from '@nestjs/common';
import { JOB_POSITIONS } from '../../data/seed-data.js';
import { JobPosition } from '../../common/types.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { ExportService } from '../export/export.service.js';

@Injectable()
export class JobsService {
  private inMemoryJobs: JobPosition[] = [...JOB_POSITIONS];

  constructor(private readonly exportService: ExportService) {}

  async findAll(query?: { department?: string; onlyCritical?: boolean; search?: string }) {
    let result = [...this.inMemoryJobs];

    if (query?.department && query.department !== 'all') {
      result = result.filter((j) => j.department.toLowerCase().includes(query.department!.toLowerCase()));
    }

    if (query?.onlyCritical) {
      result = result.filter((j) => j.status === 'critical');
    }

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.code.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q),
      );
    }

    return {
      total: result.length,
      data: result,
    };
  }

  async findOne(code: string): Promise<JobPosition> {
    const job = this.inMemoryJobs.find(
      (j) => j.code.toLowerCase() === code.toLowerCase() || (j as any).id === code,
    );
    if (!job) {
      throw new NotFoundException(`Puesto con código ${code} no encontrado`);
    }
    return job;
  }

  async create(createDto: CreateJobDto): Promise<JobPosition> {
    const newJob: JobPosition = {
      code: createDto.code,
      title: createDto.title,
      department: createDto.department,
      status: createDto.status,
      activeIncumbentsCount: 1,
      complianceRate: 100,
      isCalibrated: true,
      division: createDto.division,
      reportsTo: createDto.reportsTo,
      supervises: createDto.supervises,
      salaryBand: createDto.salaryBand,
      incumbents: [],
      mission: createDto.mission,
      purposeLink: 'Impacto directo en la continuidad operativa de la plataforma.',
      internalRelations: 'Comité de Arquitectura, Equipos de Producto.',
      externalRelations: 'Proveedores de Nube (AWS, GCP).',
      formalAuthority: 'Aprobación de RFCs de Arquitectura.',
      responsibilities: [],
      workingConditions: {
        modality: 'Remoto 100% con guardias rotativas',
        tools: 'MacBook Pro M3 Max, acceso root a clusters',
        mobility: 'No requerida',
      },
      techSkills: createDto.techSkills || [],
      softSkills: createDto.softSkills || [],
    };

    this.inMemoryJobs.push(newJob);
    return newJob;
  }

  async openVacancy(code: string) {
    const job = await this.findOne(code);
    return {
      message: `Vacante abierta exitosamente para el puesto: ${job.title}`,
      jobCode: job.code,
      jobTitle: job.title,
      department: job.department,
      recruitmentUrl: `/reclutamiento/${job.code}`,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
    };
  }

  async exportMatrix(format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') {
    const allJobs = await this.findAll();
    const jobsList = allJobs.data;

    if (format === 'pdf') {
      const rows = jobsList.map((j) => ({
        label: `${j.code} - ${j.title}`,
        value: `${j.department} | ${j.status === 'critical' ? 'Crítico (SPOF Risk)' : 'Operacional'} | Banda: ${j.salaryBand} | Cumplimiento: ${j.complianceRate}%`,
      }));
      const buffer = await this.exportService.generatePdf(
        'Matriz de Descriptivos de Puesto de Trabajo (DPT)',
        'Estructura de cargos, áreas organizacionales y requerimientos técnicos',
        rows,
      );
      return {
        buffer,
        contentType: 'application/pdf',
        filename: `Matriz_Puestos_NEXUS_${Date.now()}.pdf`,
      };
    }

    const columns = [
      { header: 'Código', key: 'code', width: 22 },
      { header: 'Título del Cargo', key: 'title', width: 35 },
      { header: 'Departamento', key: 'department', width: 30 },
      { header: 'Estado/Criticidad', key: 'status', width: 18 },
      { header: 'Ocupantes Activos', key: 'activeIncumbentsCount', width: 18 },
      { header: 'Tasa Cumplimiento (%)', key: 'complianceRate', width: 22 },
      { header: 'Banda Salarial', key: 'salaryBand', width: 25 },
      { header: 'Reporta A', key: 'reportsTo', width: 30 },
    ];

    const data = jobsList.map((j) => ({
      code: j.code,
      title: j.title,
      department: j.department,
      status: j.status === 'critical' ? 'Crítico (SPOF Risk)' : 'Operacional',
      activeIncumbentsCount: j.activeIncumbentsCount,
      complianceRate: `${j.complianceRate}%`,
      salaryBand: j.salaryBand,
      reportsTo: j.reportsTo,
    }));

    if (format === 'csv') {
      const csvColumns = columns.map((c) => c.header);
      const csvRows = data.map((d) => [
        d.code,
        d.title,
        d.department,
        d.status,
        d.activeIncumbentsCount,
        d.complianceRate,
        d.salaryBand,
        d.reportsTo,
      ]);
      return {
        buffer: Buffer.from(this.exportService.generateCsv(csvColumns, csvRows)),
        contentType: 'text/csv',
        filename: `Matriz_Puestos_NEXUS_${Date.now()}.csv`,
      };
    }

    const buffer = await this.exportService.generateExcel('Matriz de Puestos', columns, data);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Matriz_Puestos_NEXUS_${Date.now()}.xlsx`,
    };
  }
}
