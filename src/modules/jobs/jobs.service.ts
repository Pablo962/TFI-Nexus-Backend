import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { JOB_POSITIONS } from '../../data/seed-data.js';
import { JobPosition } from '../../common/types.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { ExportService } from '../export/export.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JobsService {
  private inMemoryJobs: JobPosition[] = [...JOB_POSITIONS];

  private readonly jobInclude = {
    unidad: {
      include: {
        unidadSuperior: true,
        subunidades: true,
      },
    },
    puestoSuperior: true,
    puestosSubordinados: true,
    perfil: {
      include: {
        perfilCompetencias: {
          include: { competencia: true },
        },
      },
    },
    funciones: {
      include: { tareas: true },
    },
    responsabilidadFicha: true,
    condicionesTrabajo: true,
    riesgosPuesto: true,
    relacionesPuesto: true,
    estandaresDesempeno: true,
  };

  constructor(
    private readonly exportService: ExportService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  private toJobPosition(j: any): JobPosition {
    let responsibilities = j.responsibilities || [];
    if ((!responsibilities || responsibilities.length === 0) && j.funciones?.length > 0) {
      responsibilities = j.funciones.map((f: any, idx: number) => ({
        number: `Func. 0${idx + 1}`,
        title: f.descripcion.length > 35 ? f.descripcion.substring(0, 32) + '...' : f.descripcion,
        description: f.descripcion,
        standard: f.tareas?.map((t: any) => t.descripcion).join('; ') || 'Cumplimiento según procedimiento estándar',
      }));
    }

    let workingConditions = j.workingConditions;
    if (!workingConditions && j.condicionesTrabajo?.length > 0) {
      workingConditions = {
        modality: j.condicionesTrabajo.map((c: any) => c.descripcion).join(' | '),
        tools: j.responsabilidadFicha?.equipoTrabajo || 'Equipos y software institucional',
        mobility: 'Según requerimiento del puesto',
      };
    }

    let techSkills = j.techSkills || [];
    let softSkills = j.softSkills || [];
    if (j.perfil?.perfilCompetencias?.length > 0) {
      const relSkills = j.perfil.perfilCompetencias.map((pc: any) => pc.competencia).filter(Boolean);
      const specific = relSkills.filter((c: any) => c.tipo === 'específica');
      const generic = relSkills.filter((c: any) => c.tipo === 'genérica');
      if (techSkills.length === 0 && specific.length > 0) {
        techSkills = specific.map((s: any) => ({
          name: s.descripcion,
          description: s.descripcion,
          level: 4,
          observedBehavior: 'Dominio operativo y aplicación rigurosa',
        }));
      }
      if (softSkills.length === 0 && generic.length > 0) {
        softSkills = generic.map((s: any) => ({
          name: s.descripcion,
          description: s.descripcion,
          level: 4,
          observedBehavior: 'Conducta demostrada en el desempeño',
        }));
      }
    }

    return {
      id: j.id,
      code: j.code,
      title: j.title,
      department: j.unidad?.nombre || j.department,
      status: j.status,
      activeIncumbentsCount: j.activeIncumbentsCount ?? j.nPosiciones ?? 1,
      complianceRate: j.complianceRate ?? 100,
      isCalibrated: true,
      division: j.division || j.unidad?.nombre || 'Dirección de Informática',
      reportsTo: j.puestoSuperior?.title || j.reportsTo || 'Dirección General',
      supervises: j.supervises || (j.puestosSubordinados?.map((s: any) => s.title).join(', ') || 'Sin supervisión directa'),
      salaryBand: j.salaryBand || 'Banda Salarial Oficial',
      incumbents: j.incumbents || [],
      mission: j.proposito || j.mission,
      purposeLink: j.purposeLink || 'Impacto directo en la continuidad operativa de la institución.',
      internalRelations: j.internalRelations || j.relacionesPuesto?.filter((r: any) => r.tipo === 'interna').map((r: any) => `${r.puestoOInstitucion} (${r.proposito})`).join('; ') || 'Coordinación interna de área',
      externalRelations: j.externalRelations || j.relacionesPuesto?.filter((r: any) => r.tipo === 'externa').map((r: any) => `${r.puestoOInstitucion} (${r.proposito})`).join('; ') || 'Organismos externos vinculados',
      formalAuthority: j.formalAuthority || 'Atribuciones conferidas por manual de funciones.',
      responsibilities,
      workingConditions: workingConditions || {
        modality: 'Condiciones normales de oficina en un 100%',
        tools: 'Terminal de trabajo y sistemas institucionales',
        mobility: 'No requerida',
      },
      techSkills,
      softSkills,

      // Extensiones relacionales completas del Word (12 tablas)
      nPosiciones: j.nPosiciones,
      proposito: j.proposito,
      idUnidad: j.idUnidad,
      unidad: j.unidad ? {
        id: j.unidad.id,
        nombre: j.unidad.nombre,
        idUnidadSuperior: j.unidad.idUnidadSuperior,
        unidadSuperior: j.unidad.unidadSuperior ? { id: j.unidad.unidadSuperior.id, nombre: j.unidad.unidadSuperior.nombre } : null,
        subunidades: j.unidad.subunidades?.map((s: any) => ({ id: s.id, nombre: s.nombre })) || [],
      } : null,
      idPuestoSuperior: j.idPuestoSuperior,
      puestoSuperior: j.puestoSuperior ? { id: j.puestoSuperior.id, code: j.puestoSuperior.code, title: j.puestoSuperior.title } : null,
      puestosSubordinados: j.puestosSubordinados?.map((s: any) => ({ id: s.id, code: s.code, title: s.title })) || [],
      funciones: j.funciones?.map((f: any) => ({
        id: f.id,
        idPuesto: f.idPuesto,
        descripcion: f.descripcion,
        tareas: f.tareas?.map((t: any) => ({ id: t.id, idFuncion: t.idFuncion, descripcion: t.descripcion })) || [],
      })) || [],
      perfil: j.perfil ? {
        idPuesto: j.perfil.idPuesto,
        educacionFormal: j.perfil.educacionFormal,
        experienciaRequerida: j.perfil.experienciaRequerida,
        competencias: j.perfil.perfilCompetencias?.map((pc: any) => pc.competencia).filter(Boolean) || [],
      } : null,
      responsabilidadFicha: j.responsabilidadFicha ? {
        idPuesto: j.responsabilidadFicha.idPuesto,
        manejoPersonal: j.responsabilidadFicha.manejoPersonal,
        equipoTrabajo: j.responsabilidadFicha.equipoTrabajo,
        manejoInformacion: j.responsabilidadFicha.manejoInformacion,
      } : null,
      condicionesTrabajoLista: j.condicionesTrabajo?.map((c: any) => ({ id: c.id, idPuesto: c.idPuesto, descripcion: c.descripcion })) || [],
      riesgosPuesto: j.riesgosPuesto?.map((r: any) => ({ id: r.id, idPuesto: r.idPuesto, tipoRiesgo: r.tipoRiesgo, motivo: r.motivo, consecuencia: r.consecuencia })) || [],
      relacionesPuesto: j.relacionesPuesto?.map((r: any) => ({ id: r.id, idPuesto: r.idPuesto, tipo: r.tipo, puestoOInstitucion: r.puestoOInstitucion, unidad: r.unidad, proposito: r.proposito })) || [],
      estandaresDesempeno: j.estandaresDesempeno?.map((e: any) => ({ id: e.id, idPuesto: e.idPuesto, descripcion: e.descripcion })) || [],
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

        const jobs = await this.prisma.jobPosition.findMany({
          where,
          include: this.jobInclude,
        });

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
          include: this.jobInclude,
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
