import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParticipationMechanismEvent {
  static fromResponse(data: ParticipationMechanismEventResponse): ParticipationMechanismEvent {
    return {
      id: data.ID?.toString() || data.ID_PA?.toString() || data.ID_PP?.toString() || null,
      status: data.ESTADO?.toLowerCase() || null,
      consecutive: data.CONSECUTIVO?.toString() || null,
      reunionId: data.ID_REUNION?.toString() || null,
      date: data.FECHA.toString(),
      hour: data.HORA?.toString() || null,
      place: data.LUGAR?.toLowerCase() || null,
      title: data.TITULO?.toLowerCase() || null,
      year: data.AÑO?.toString() || null,
      topic: data.TEMA?.toLowerCase() || null,
      debate: data.DEBATE?.toLowerCase() || null,
      description: data.descripcion?.toLowerCase() || null,
      topics: data.TEMAS?.map((tema) => tema.toLowerCase()) || null,
      exhaustedAgenda: data.AGOTADO_ORDEN_DIA?.toLowerCase() || null,
      consecutivePlenary: data.CONSECUTIVO_PLENARIA?.toString() || null,
    };
  }

  @ApiPropertyOptional({
    description: 'Unique identifier of the participation mechanism',
    example: '1',
    required: false,
  })
  id?: string | null;

  @ApiPropertyOptional({
    description: 'Status of the participation mechanism',
    example: 'active',
    required: false,
  })
  status?: string | null;

  @ApiPropertyOptional({
    description: 'Consecutive number of the participation mechanism',
    example: '1',
    required: false,
  })
  consecutive?: string | null;

  @ApiPropertyOptional({
    description: 'Meeting ID associated with the participation mechanism',
    example: '1',
    required: false,
  })
  reunionId?: string | null;

  @ApiProperty({
    description: 'Date of the participation mechanism',
    example: '2025-10-01',
    required: false,
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Time of the participation mechanism',
    example: '10:00',
    required: false,
  })
  hour?: string | null;

  @ApiPropertyOptional({
    description: 'Location of the participation mechanism',
    example: 'session room',
    required: false,
  })
  place?: string | null;

  @ApiPropertyOptional({
    description: 'Title of the participation mechanism',
    example: 'participation mechanism title',
    required: false,
  })
  title?: string | null;

  @ApiPropertyOptional({
    description: 'Year of the participation mechanism',
    example: '2025',
    required: false,
  })
  year?: string | null;

  @ApiPropertyOptional({
    description: 'Topic of the participation mechanism',
    example: 'participation topic',
    required: false,
  })
  topic?: string | null;

  @ApiPropertyOptional({
    description: 'Debate type of the participation mechanism',
    example: 'study',
    required: false,
  })
  debate?: string | null;

  @ApiPropertyOptional({
    description: 'Description of the participation mechanism',
    example: 'participation mechanism description',
    required: false,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Topics array for plenary sessions',
    example: ['topic 1', 'topic 2'],
    required: false,
  })
  topics?: string[] | null;

  @ApiPropertyOptional({
    description: 'Whether agenda is exhausted',
    example: 'yes',
    required: false,
  })
  exhaustedAgenda?: string | null;

  @ApiPropertyOptional({
    description: 'Consecutive number for plenary sessions',
    example: '1',
    required: false,
  })
  consecutivePlenary?: string | null;
}

export interface ParticipationMechanismEventResponse {
  // Common fields
  ID?: string | null;
  ESTADO?: string | null;
  CONSECUTIVO?: string | null;
  ID_REUNION?: string | null;
  FECHA: string;
  HORA?: string | null;
  LUGAR?: string | null;
  TITULO?: string | null;
  AÑO?: string | null;

  // Participation specific fields
  ID_PA?: string | null;
  TEMA?: string | null;
  DEBATE?: string | null;

  // AccidentalCommission specific fields
  ID_PP?: string | null;

  // PlenarySession specific fields
  descripcion?: string | null;
  TEMAS?: string[] | null;
  AGOTADO_ORDEN_DIA?: string | null;
  CONSECUTIVO_PLENARIA?: string | null;
}
