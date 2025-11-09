import { ApiPropertyOptional } from '@nestjs/swagger';

export class InterestTopic {
  @ApiPropertyOptional({
    description: 'Unique identifier of the interest topic',
    example: 1,
    required: false,
  })
  id?: number | null;

  @ApiPropertyOptional({
    description: 'Name of the interest topic',
    example: 'Salud',
    required: false,
  })
  topic?: string | null;

  static fromResponse(data: InterestTopicResponse): InterestTopic {
    const interestTopic: InterestTopic = {
      id: data.id ?? null,
      topic: typeof data.tema === 'string' ? data.tema.toLowerCase() : null,
    };

    return interestTopic;
  }
}

export interface InterestTopicResponse {
  id: number;
  tema: string;
}
