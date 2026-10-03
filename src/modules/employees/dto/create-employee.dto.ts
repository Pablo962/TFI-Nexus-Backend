import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'lucas' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'NX-4029' })
  @IsNotEmpty()
  empId: string;

  @ApiProperty({ example: 'Ing. Lucas Valenzuela' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Arquitecto Principal de Nube e IA' })
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Infraestructura y Plataforma' })
  @IsNotEmpty()
  area: string;

  @ApiProperty({ example: 'lucas.valenzuela@nexus.tech' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '3.5 años' })
  @IsNotEmpty()
  tenure: string;

  @ApiProperty({ example: 'Banda E7' })
  @IsNotEmpty()
  salaryBand: string;

  @ApiPropertyOptional({ example: 9.5 })
  @IsOptional()
  @IsNumber()
  criticality?: number;
}
