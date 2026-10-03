import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PorterService } from './porter.service.js';
import { SimulateDto } from './dto/simulate.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Cadena de Valor y Estrategia - Porter (Porter)')
@Controller('porter')
export class PorterController {
  constructor(private readonly porterService: PorterService) {}

  @Get('activities')
  @ApiOperation({ summary: 'Obtener eslabones de la Cadena de Valor (Primarias y Apoyo)' })
  async findAll() {
    return this.porterService.findAll();
  }

  @Get('activities/:id')
  @ApiOperation({ summary: 'Obtener detalle de una actividad específica de la Cadena de Valor' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.porterService.findOne(id);
  }

  @Post('simulate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Ejecutar simulación presupuestaria y reasignación de headcount' })
  async simulate(@Body() simulateDto: SimulateDto) {
    return this.porterService.simulate(simulateDto);
  }
}
