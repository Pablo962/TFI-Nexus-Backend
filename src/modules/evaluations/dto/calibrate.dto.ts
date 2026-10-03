import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CalibrateDto {
  @ApiProperty({ example: 4.85, description: 'Puntaje final calibrado en comité (1.0 a 5.0)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  calibratedScore: number;

  @ApiProperty({
    example: 'Talento Destacado (Estrella)',
    description: 'Cuadrante asignado en la Matriz 9-Box',
  })
  @IsNotEmpty()
  box9: string;

  @ApiProperty({ example: 'Comité consensuó ascenso por desempeño excepcional.' })
  @IsNotEmpty()
  notes: string;
}
