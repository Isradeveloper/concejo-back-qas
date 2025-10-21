import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Event as PrismaEvent } from '@prisma/client';

export class Event {
  static fromPrisma(event: PrismaEvent): Event {
    const eventEntity = new Event();
    Object.assign(eventEntity, event);
    return eventEntity;
  }

  @ApiProperty({
    description: 'ID del evento',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Código del evento SIMI',
    example: 'SIMI-2024-001',
  })
  simiEventCode: string;

  @ApiProperty({
    description: 'Tipo de evento',
    example: 'plenary-session',
  })
  type: string;

  @ApiProperty({
    description: 'Descripción del evento',
    example: 'Sesión plenaria sobre participación ciudadana',
  })
  description: string;

  @ApiProperty({
    description: 'Fecha del evento',
    example: new Date(),
  })
  date: Date;

  @ApiProperty({
    description: 'Hora del evento',
    example: '14:00',
  })
  hour: string;

  @ApiProperty({
    description: 'Lugar del evento',
    example: 'Auditorio Principal',
  })
  place: string;

  @ApiPropertyOptional({
    description: 'Tema del evento',
    example: 'Participación ciudadana en la toma de decisiones',
  })
  topic?: string;

  @ApiPropertyOptional({
    description: 'Profesional especializado del evento',
    example: 'Dr. Juan Pérez',
  })
  specializedProfessional?: string;

  @ApiPropertyOptional({
    description: 'Coordinador del evento',
    example: 'María García',
  })
  coordinator?: string;

  @ApiProperty({
    description: 'Ponentes del evento',
    example: ['Dr. Ana López', 'Prof. Carlos Ruiz'],
    isArray: true,
  })
  speakers: string[];

  @ApiPropertyOptional({
    description: 'Miembros del evento',
    example: [
      { name: 'Juan Pérez', bench: 'Coordinador' },
      { name: 'María García', bench: 'Ponente' },
    ],
    isArray: true,
  })
  members?: { name: string; bench: string }[];

  @ApiProperty({
    description: 'Estado del evento',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Fecha de creación del evento',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de actualización del evento',
    example: new Date(),
  })
  updatedAt?: Date;
}
