import { Controller, Get, Patch, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { EvaluationsService } from './evaluations.service.js';
import { CalibrateDto } from './dto/calibrate.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Desempeño y Evaluación 360° (Evaluations)')
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las evaluaciones del ciclo actual' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string) {
    return this.evaluationsService.findAll({ status });
  }

  @Get('9box')
  @ApiOperation({ summary: 'Obtener datos consolidados y distribución de la Matriz 9-Box Grid' })
  async get9BoxData() {
    return this.evaluationsService.get9BoxData();
  }

  @Get('export')
  @Get('9box/export')
  @ApiOperation({ summary: 'Exportar acta del comité 9-Box en formato Excel (.xlsx), CSV o PDF (.pdf)' })
  @ApiQuery({ name: 'format', enum: ['xlsx', 'csv', 'pdf'], required: false })
  async export9Box(@Query('format') format: 'xlsx' | 'csv' | 'pdf' = 'xlsx', @Res() res: Response) {
    const { buffer, contentType, filename } = await this.evaluationsService.export9Box(format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @Patch(':id/calibrate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modificar y consensuar la calificación de un colaborador en el comité de calibración' })
  async calibrate(@Param('id') id: string, @Body() calibrateDto: CalibrateDto) {
    return this.evaluationsService.calibrate(id, calibrateDto);
  }
}
