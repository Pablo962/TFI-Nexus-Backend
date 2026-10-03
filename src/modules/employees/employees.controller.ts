import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Colaboradores y Personas (Employees)')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los colaboradores con filtros' })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('area') area?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findAll({ area, status, search });
  }

  @Get('talent-map')
  @ApiOperation({ summary: 'Obtener datos multidimensionales para el Mapa de Talento y análisis SPOF' })
  @ApiQuery({ name: 'domain', required: false })
  @ApiQuery({ name: 'risk', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findTalentPersons(
    @Query('domain') domain?: string,
    @Query('risk') risk?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findTalentPersons({ domain, risk, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener la ficha 360° completa de un colaborador por ID' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear nuevo colaborador (Solo Administrador de RRHH)' })
  async create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar ficha de un colaborador' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.employeesService.update(id, updateDto);
  }
}
