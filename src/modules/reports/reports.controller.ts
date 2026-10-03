import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service.js';

@ApiTags('Informes y Reportes Analíticos (Reports)')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-kpis')
  @ApiOperation({ summary: 'Obtener indicadores ejecutivos consolidados (KPIs)' })
  @ApiQuery({ name: 'quarter', required: false, example: 'Q4 2026' })
  getDashboardKpis(@Query('quarter') quarter?: string) {
    return this.reportsService.getDashboardKpis(quarter);
  }

  @Get('squads-heatmap')
  @ApiOperation({ summary: 'Obtener matriz de calor de competencias por equipo/squad' })
  getSquadsHeatmap() {
    return this.reportsService.getSquadsHeatmap();
  }

  @Get('skills-inventory')
  @ApiOperation({ summary: 'Obtener inventario estructurado de habilidades verificadas' })
  getSkillsInventory() {
    return this.reportsService.getSkillsInventory();
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar informe de analítica de squads en Excel (.xlsx) o CSV' })
  @ApiQuery({ name: 'format', enum: ['xlsx', 'csv'], required: false })
  async exportReport(@Query('format') format: 'xlsx' | 'csv' = 'xlsx', @Res() res: Response) {
    const { buffer, contentType, filename } = await this.reportsService.exportReport(format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @Get('export/skills-json')
  @ApiOperation({ summary: 'Exportar inventario de competencias en formato JSON descargable' })
  async exportSkillsJson(@Res() res: Response) {
    const inventory = this.reportsService.getSkillsInventory();
    const jsonString = JSON.stringify(inventory, null, 2);
    const filename = `Inventario_Competencias_NEXUS_${Date.now()}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(jsonString);
  }
}
