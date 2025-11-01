import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerCiteQuestionDto {
  @ApiProperty({
    description: 'La respuesta a la pregunta de cita',
    example: 'Creo que esta es una buena propuesta para nuestra comunidad.',
  })
  @IsNotEmpty({ message: 'La respuesta es requerida' })
  @IsString({ message: 'La respuesta debe ser una cadena de texto' })
  answer: string;
}
