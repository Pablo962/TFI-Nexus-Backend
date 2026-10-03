import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { JOB_POSITIONS } from '../../data/seed-data.js';
import { JobPosition } from '../../common/types.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { ExportService } from '../export/export.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JobsService {
  private inMemoryJobs: JobPosition[] = [...JOB_POSITIONS];

  constructor(
    private readonly exportService: ExportService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  private toJobPosition(j: any): JobPosition {
    return {
      code: j.code,
      title: j.title,
      department: j.department,
      status: j.status,
      activeIncumbentsCount: j.activeIncumbentsCount,
      complianceRate: j.complianceRate,
      isCalibrated: true,
      division: j.division,
      reportsTo: j.reportsTo,
      supervises: j.supervises,
      salaryBand: j.salaryBand,
      incumbents: j.incumbents || [],
      mission: j.mission,
      purposeLink: j.purposeLink || 'Impacto directo en la continuidad operativa de la plataforma.',
      internalRelations: j.internalRelations || 'Comité de Arquitectura, Equipos de Producto.',
      externalRelations: j.externalRelations || 'Proveedores de Nube (AWS, GCP).',
      formalAuthority: j.formalAuthority || 'Aprobación de RFCs de Arquitectura.',
      responsibilities: j.responsibilities || [],
      workingConditions: j.workingConditions || {
        modality: 'Remoto 100% con guardias rotativas',
        tools: 'MacBook Pro M3 Max, acceso root a clusters',
        mobility: 'No requerida',
      },
      techSkills: j.techSkills || [],
      softSkills: j.softSkills || [],
    };
  }

  async findAll(query?: { department?: string; onlyCritical?: boolean; search?: string }) {
    if (this.prisma) {
      try {
        const where: any = {};
        if (query?.department && query.department !== 'all') {
          where.department = { contains: query.department, mode: 'insensitive' };
        }
        if (query?.onlyCritical) {
          where.status = 'critical';
        }
        if (query?.search) {
          where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
            { department: { contains: query.search, mode: 'insensitive' } },
          ];
        }

        const jobs = await this.prisma.jobPosition.findMany({ where });
        if (jobs.length > 0 || query?.search || query?.department || query?.onlyCritical) {
          return {
            total: jobs.length,
            data: jobs.map((j) => this.toJobPosition(j)),
          };
        }
      } catch {
        // Fallback a memoria
      }
    }

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
    if (this.prisma) {
      try {
        const job = await this.prisma.jobPosition.findFirst({
          where: {
            OR: [
              { code: { equals: code, mode: 'insensitive' } },
              { id: code },
            ],
          },
        });
        if (job) {
          return this.toJobPosition(job);
        }
      } catch {
        // Fallback a memoria
      }
    }

    const job = this.inMemoryJobs.find((j) => j.code.toLowerCase() === code.toLowerCase());
    if (!job) {
      throw new NotFoundException(`Puesto con código ${code} no encontrado`);
    }
    return job;
  }

  async create(createDto: CreateJobDto): Promise<JobPosition> {
    if (this.prisma) {
      try {
        const created = await this.prisma.jobPosition.create({
          data: {
            code: createDto.code,
            title: createDto.title,
            department: createDto.department,
            status: createDto.status,
            activeIncumbentsCount: 1,
            complianceRate: 100,
            division: createDto.division,
            reportsTo: createDto.reportsTo,
            supervises: createDto.supervises,
            salaryBand: createDto.salaryBand,
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
          },
        });
        return this.toJobPosition(created);
      } catch {
        // Fallback a memoria
      }
    }

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

  async exportMatrix(format: 'xlsx' | 'csv' = 'xlsx') {
    const allJobs = await this.findAll();
    const jobsList = allJobs.data;

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
