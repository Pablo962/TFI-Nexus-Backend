import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { EMPLOYEES_DATA, TALENT_PERSONS } from '../../data/seed-data.js';
import { EmployeeProfile, TalentPerson } from '../../common/types.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { ExportService } from '../export/export.service.js';

@Injectable()
export class EmployeesService {
  private inMemoryEmployees: EmployeeProfile[] = [...EMPLOYEES_DATA];
  private inMemoryTalentPersons: TalentPerson[] = [...TALENT_PERSONS];

  constructor(
    @Optional() private readonly exportService?: ExportService,
  ) {}

  async findAll(query?: { area?: string; search?: string; status?: string }) {
    let result = [...this.inMemoryEmployees];

    if (query?.area && query.area !== 'all') {
      result = result.filter((e) => e.area.toLowerCase().includes(query.area!.toLowerCase()));
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((e) => e.status.toLowerCase() === query.status!.toLowerCase());
    }

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.empId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      );
    }

    return {
      total: result.length,
      data: result,
    };
  }

  async findTalentPersons(query?: { domain?: string; risk?: string; search?: string }) {
    let result = [...this.inMemoryTalentPersons];

    if (query?.risk && query.risk !== 'all') {
      result = result.filter((t) => t.riskStatus === query.risk);
    }

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.squad.toLowerCase().includes(q),
      );
    }

    return {
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string): Promise<EmployeeProfile> {
    const employee = this.inMemoryEmployees.find((e) => e.id === id || e.empId === id);
    if (!employee) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }
    return employee;
  }

  async create(createDto: CreateEmployeeDto): Promise<EmployeeProfile> {
    const newEmployee: EmployeeProfile = {
      id: createDto.id,
      empId: createDto.empId,
      name: createDto.name,
      role: createDto.role,
      area: createDto.area,
      tenure: createDto.tenure,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      email: createDto.email,
      phone: '+54 9 11 5555-0100',
      contract: 'Plazo Indeterminado (Full-time)',
      location: 'Campus Central',
      salaryBand: createDto.salaryBand,
      percentile: 'Percentil 50',
      supervisor: {
        name: 'Martín Krause',
        role: 'VP de Ingeniería',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      },
      roleMatch: 90,
      gFactor: 1.0,
      status: 'Óptimo',
      badge: 'Nuevo Ingreso',
      spectrumSkills: [],
      hardSkills: [],
      softSkills: [],
      recommendedTraining: {
        title: 'Inducción de Arquitectura y Estándares',
        hours: '20 horas',
        description: 'Capacitación en gobernanza técnica y estándares de código.',
        perks: ['Gobernanza', 'Seguridad'],
        gapTarget: 'Alineación organizativa',
      },
      reviews: [],
      projects: [],
    };

    this.inMemoryEmployees.push(newEmployee);
    return newEmployee;
  }

  async update(id: string, updateData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    const index = this.inMemoryEmployees.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }
    this.inMemoryEmployees[index] = { ...this.inMemoryEmployees[index], ...updateData };
    return this.inMemoryEmployees[index];
  }

  async exportEmployeePdf(id: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const emp = await this.findOne(id);
    if (!this.exportService) {
      throw new Error('ExportService no disponible');
    }

    const rows: Array<{ label: string; value: string }> = [
      { label: 'Nombre Completo', value: emp.name },
      { label: 'Legajo / ID', value: emp.empId || emp.id },
      { label: 'Cargo / Posición', value: emp.role },
      { label: 'Área / Squad', value: emp.area },
      { label: 'Antigüedad', value: emp.tenure || 'N/A' },
      { label: 'Contrato y Modalidad', value: `${emp.contract || 'Indefinido'} - ${emp.location || 'Híbrido'}` },
      { label: 'Correo Electrónico', value: emp.email || 'N/A' },
      { label: 'Teléfono', value: emp.phone || 'N/A' },
      { label: 'Banda Salarial / Percentil', value: `${emp.salaryBand || 'N/A'} (P${emp.percentile || 50})` },
      { label: 'Alineación al Rol (Role Match)', value: `${emp.roleMatch || 0}%` },
      { label: 'Índice de Potencial (g-Factor)', value: `${emp.gFactor || 0}/10` },
      { label: 'Estado Operativo', value: emp.status || 'Activo' },
      { label: 'Líder / Supervisor', value: `${emp.supervisor?.name || 'N/A'} (${emp.supervisor?.role || 'Líder'})` },
      { label: 'Capacitación Recomendada', value: emp.recommendedTraining?.title ? `${emp.recommendedTraining.title} (${emp.recommendedTraining.hours || ''})` : 'En plan de carrera' },
    ];

    if (emp.hardSkills && emp.hardSkills.length > 0) {
      rows.push({
        label: 'Competencias Técnicas Clave',
        value: emp.hardSkills.map((s) => `${s.name}: ${s.actual}/5`).join(' | '),
      });
    }

    const title = `Ficha Técnica 360° · ${emp.name}`;
    const subtitle = `Legajo: ${emp.empId || emp.id} | Cargo: ${emp.role} | Área: ${emp.area}`;
    const buffer = await this.exportService.generatePdf(title, subtitle, rows);
    const filename = `Ficha_Colaborador_${emp.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    return {
      buffer,
      contentType: 'application/pdf',
      filename,
    };
  }
}
