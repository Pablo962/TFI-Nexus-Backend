import { describe, it, expect, beforeEach } from 'vitest';
import { EmployeesService } from './employees.service.js';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(() => {
    service = new EmployeesService();
  });

  it('debe listar colaboradores y filtrar por búsqueda', async () => {
    const all = await service.findAll();
    expect(all.total).toBeGreaterThan(0);

    const filtered = await service.findAll({ search: 'Lucas' });
    expect(filtered.total).toBeGreaterThan(0);
    expect(filtered.data[0].name).toContain('Lucas');
  });

  it('debe obtener la ficha 360 de un colaborador', async () => {
    const emp = await service.findOne('lucas');
    expect(emp).toBeDefined();
    expect(emp.id).toBe('lucas');
    expect(emp.salaryBand).toBeDefined();
    expect(emp.hardSkills.length).toBeGreaterThan(0);
  });

  it('debe listar las personas para el mapa de talento', async () => {
    const talent = await service.findTalentPersons();
    expect(talent.total).toBeGreaterThan(0);
    const spof = talent.data.find((t) => t.riskStatus === 'spof');
    expect(spof).toBeDefined();
  });
});
