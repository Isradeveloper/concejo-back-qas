import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { CreateCiteQuestionDto } from './create-cite-question.dto';
import { Type } from 'class-transformer';

export class CreateCiteDto {
  @ApiProperty({})
  @IsNotEmpty({ message: 'El usuario es requerido' })
  @IsInt({ message: 'El usuario debe ser un número' })
  @IsPositive({ message: 'El usuario debe ser un número positivo' })
  userId: number;

  @ApiProperty({
    type: [CreateCiteQuestionDto],
    isArray: true,
  })
  @IsNotEmpty({ message: 'Las preguntas son requeridas' })
  @IsArray({ message: 'Las preguntas deben ser un array' })
  @ArrayMaxSize(20, { message: 'Las citaciones deben tener como máximo 20 preguntas' })
  @ValidateNested({ each: true })
  @Type(() => CreateCiteQuestionDto)
  questions: CreateCiteQuestionDto[];
}
