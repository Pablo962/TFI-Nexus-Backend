import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingService } from './training.service.js';
import { EnrollDto } from './dto/enroll.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Capacitación y Upskilling (Training)')
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('tracks')
  @ApiOperation({ summary: 'Obtener catálogo de itinerarios formativos para cierre de brechas' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    return this.trainingService.findAll({ category });
  }

  @Get('tracks/:id')
  @ApiOperation({ summary: 'Obtener detalle de un itinerario formativo por ID' })
  async findOne(@Param('id') id: string) {
    return this.trainingService.findOne(id);
  }

  @Post('enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.MANAGER, Role.EMPLOYEE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Inscribir a un colaborador en un itinerario formativo' })
  async enroll(@Body() enrollDto: EnrollDto) {
    return this.trainingService.enroll(enrollDto);
  }
}
