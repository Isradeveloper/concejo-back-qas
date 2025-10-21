import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CiteQuestion as PrismaCiteQuestion } from '@prisma/client';

export class CiteQuestion {
  static fromPrisma(citeQuestion: PrismaCiteQuestion): CiteQuestion {
    return {
      id: citeQuestion.id,
      registrationCiteId: citeQuestion.registrationCiteId,
      question: citeQuestion.question,
      answer: citeQuestion.answer,
      answeredAt: citeQuestion.answeredAt,
      createdAt: citeQuestion.createdAt,
      updatedAt: citeQuestion.updatedAt,
    };
  }

  @ApiProperty({
    description: 'The id of the cite question',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The registration cite id',
    example: 1,
  })
  registrationCiteId: number;

  @ApiProperty({
    description: 'The question text',
    example: 'What is your opinion about this proposal?',
  })
  question: string;

  @ApiPropertyOptional({
    description: 'The answer to the question',
    example: 'I think this is a good proposal for our community.',
  })
  answer?: string | null;

  @ApiPropertyOptional({
    description: 'The date when the question was answered',
    example: '2023-01-01T00:00:00.000Z',
  })
  answeredAt?: Date | null;

  @ApiProperty({
    description: 'The date when the cite question was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The date when the cite question was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt?: Date | null;
}
