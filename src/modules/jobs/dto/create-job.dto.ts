import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ example: 'PUE-2026-ARCH-03' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Arquitecto Principal de Nube e IA' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Infraestructura y Plataforma' })
  @IsNotEmpty()
  department: string;

  @ApiProperty({ enum: ['critical', 'operational'], default: 'critical' })
  @IsEnum(['critical', 'operational'])
  status: 'critical' | 'operational';

  @ApiProperty({ example: 'Ingeniería & Plataforma Global' })
  @IsNotEmpty()
  division: string;

  @ApiProperty({ example: 'VP de Infraestructura & Plataforma' })
  @IsNotEmpty()
  reportsTo: string;

  @ApiProperty({ example: 'Arquitectos Cloud Sr, Tech Leads' })
  @IsNotEmpty()
  supervises: string;

  @ApiProperty({ example: 'Banda E7 / Nivel L6' })
  @IsNotEmpty()
  salaryBand: string;

  @ApiProperty({ example: 'Liderar la arquitectura técnica de nube y plataformas.' })
  @IsNotEmpty()
  mission: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  techSkills?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  softSkills?: any[];
}
