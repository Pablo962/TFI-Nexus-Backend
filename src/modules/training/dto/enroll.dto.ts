import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EnrollDto {
  @ApiProperty({ example: 'finops' })
  @IsNotEmpty()
  trackId: string;

  @ApiProperty({ example: 'lucas' })
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'Ing. Lucas Valenzuela' })
  @IsNotEmpty()
  employeeName: string;
}
