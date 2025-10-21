import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationMechanism as PrismaParticipationMechanism } from '@prisma/client';

export class ParticipationMechanism {
  static fromPrisma(participationMechanism: PrismaParticipationMechanism): ParticipationMechanism {
    return {
      ...participationMechanism,
    } as ParticipationMechanism;
  }

  @ApiProperty({
    description: 'ID del mecanismo de participación',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del mecanismo de participación',
    example: 'Sesiones plenarias',
  })
  name: string;

  @ApiProperty({
    description: 'Tipo del mecanismo de participación',
    example: 'plenary-session',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Subtítulo del mecanismo de participación',
    example: 'Proyecto de acuerdo',
  })
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción del mecanismo de participación',
    example: 'Sesiones plenarias',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Icono del mecanismo de participación',
    example: 'icon',
  })
  icon?: string;

  @ApiProperty({
    description: 'Estado del mecanismo de participación',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Fecha de creación del mecanismo de participación',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de actualización del mecanismo de participación',
    example: new Date(),
  })
  updatedAt?: Date;
}
