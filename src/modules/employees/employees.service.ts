import { Injectable, NotFoundException } from '@nestjs/common';
import { EMPLOYEES_DATA, TALENT_PERSONS } from '../../data/seed-data.js';
import { EmployeeProfile, TalentPerson } from '../../common/types.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';

@Injectable()
export class EmployeesService {
  private employees: EmployeeProfile[] = [...EMPLOYEES_DATA];
  private talentPersons: TalentPerson[] = [...TALENT_PERSONS];

  async findAll(query?: { area?: string; search?: string; status?: string }) {
    let result = [...this.employees];

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
    let result = [...this.talentPersons];

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
    const employee = this.employees.find((e) => e.id === id);
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

    this.employees.push(newEmployee);
    return newEmployee;
  }

  async update(id: string, updateData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }
    this.employees[index] = { ...this.employees[index], ...updateData };
    return this.employees[index];
  }
}
