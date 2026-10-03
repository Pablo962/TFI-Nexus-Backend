import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({
    example: 'Entrevista Técnica',
    description: 'Etapa del pipeline (Revisión Inicial, Entrevista Técnica, Validación Cultural, Oferta Final, Oferta Enviada, Contratado)',
  })
  @IsNotEmpty()
  stage: string;
}
