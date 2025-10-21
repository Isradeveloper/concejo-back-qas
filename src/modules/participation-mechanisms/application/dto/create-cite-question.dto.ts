import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCiteQuestionDto {
  @ApiProperty({})
  @IsNotEmpty({ message: 'La pregunta es requerida' })
  @IsString({ message: 'La pregunta debe ser una cadena de texto' })
  question: string;
}
