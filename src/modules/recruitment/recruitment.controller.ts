import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service.js';
import { UpdateStageDto } from './dto/update-stage.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';

@ApiTags('Selección y Reclutamiento (Recruitment)')
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('candidates')
  @ApiOperation({ summary: 'Obtener lista de candidatos en selección con Match Scores' })
  @ApiQuery({ name: 'jobCode', required: false })
  @ApiQuery({ name: 'minMatch', required: false, type: Number })
  async findAll(@Query('jobCode') jobCode?: string, @Query('minMatch') minMatch?: string) {
    return this.recruitmentService.findAll({
      jobCode,
      minMatch: minMatch ? parseInt(minMatch, 10) : undefined,
    });
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Obtener detalle y radar de habilidades de un candidato' })
  async findOne(@Param('id') id: string) {
    return this.recruitmentService.findOne(id);
  }

  @Patch('candidates/:id/stage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.RECRUITER, Role.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mover un candidato a una etapa posterior del pipeline' })
  async updateStage(@Param('id') id: string, @Body() updateDto: UpdateStageDto) {
    return this.recruitmentService.updateStage(id, updateDto.stage);
  }

  @Post('candidates/:id/offer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_HR, Role.RECRUITER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Emitir y enviar oferta formal de contratación al candidato' })
  async sendOffer(@Param('id') id: string, @Body() offerBody?: { salary?: string; startDate?: string }) {
    return this.recruitmentService.sendOffer(id, offerBody);
  }
}
