import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { CreateRegistrationDto } from './create-registration.dto';
import { CreateCiteDto } from './create-cite.dto';
import { Type } from 'class-transformer';

export class CreateProposalRegisterDto extends CreateRegistrationDto {
  @ApiProperty({})
  @IsOptional()
  @IsString({ message: 'El tema político debe ser una cadena de texto' })
  politicalTopic: string;

  @ApiProperty({})
  @IsOptional()
  @IsString({ message: 'La justificación del tema político debe ser una cadena de texto' })
  politicalTopicJustification: string;

  @ApiProperty({
    type: [CreateCiteDto],
    isArray: true,
    example: [
      {
        userId: 1,
        questions: [
          {
            question: 'Pregunta 1',
          },
          {
            question: 'Pregunta 2',
          },
          {
            question: 'Pregunta 3',
          },
        ],
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Las citaciones deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CreateCiteDto)
  cites: CreateCiteDto[];
}
