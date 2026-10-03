import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum.js';

export class RegisterDto {
  @ApiProperty({ example: 'admin@nexus.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Administrador RRHH' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Role, default: Role.EMPLOYEE })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: 'lucas' })
  @IsOptional()
  employeeId?: string;
}
