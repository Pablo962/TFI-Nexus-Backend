import { Controller, Get, Post, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { JobsService } from './jobs.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Puestos y Perfiles (Jobs)')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener catálogo general de puestos de trabajo' })
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'onlyCritical', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('department') department?: string,
    @Query('onlyCritical') onlyCritical?: string,
    @Query('search') search?: string,
  ) {
    return this.jobsService.findAll({
      department,
      onlyCritical: onlyCritical === 'true',
      search,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar la matriz completa de puestos en Excel (.xlsx), CSV o PDF (.pdf)' })
  @ApiQuery({ name: 'format', enum: ['xlsx', 'csv', 'pdf'], required: false })
  async exportMatrix(@Query('format') format: 'xlsx' | 'csv' | 'pdf' = 'xlsx', @Res() res: Response) {
    const { buffer, contentType, filename } = await this.jobsService.exportMatrix(format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Obtener el detalle completo de un puesto por su código único' })
  async findOne(@Param('code') code: string) {
    return this.jobsService.findOne(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear un nuevo puesto de trabajo (Solo Administrador de RRHH)' })
  async create(@Body() createDto: CreateJobDto) {
    return this.jobsService.create(createDto);
  }

  @Post(':code/open-vacancy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.RECRUITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Abrir vacante de reclutamiento para el puesto especificado' })
  async openVacancy(@Param('code') code: string) {
    return this.jobsService.openVacancy(code);
  }
}
