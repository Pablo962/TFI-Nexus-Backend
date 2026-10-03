import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SimulateDto {
  @ApiProperty({ example: 38, description: 'Nuevo headcount proyectado para la actividad' })
  @IsNumber()
  @Min(1)
  headcount: number;

  @ApiProperty({ example: 120, description: 'Presupuesto adicional asignado en miles de USD' })
  @IsNumber()
  @Min(0)
  budgetK: number;

  @ApiProperty({ example: 2, description: 'ID de la actividad de la cadena de valor (1-5)' })
  @IsNotEmpty()
  activityId: number;
}
