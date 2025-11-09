import { User } from 'src/modules/users/domain/entities/user.entity';
import { ParticipationMechanism } from './participation-mechanism.entity';
import { Event } from './event.entity';
import {
  Registration as PrismaRegistration,
  User as PrismaUser,
  ParticipationMechanism as PrismaParticipationMechanism,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  Dependency as PrismaDependency,
  Event as PrismaEvent,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Registration {
  static fromPrisma(
    registration: PrismaRegistration & {
      user: PrismaUser & {
        userType: PrismaUserType;
        documentType: PrismaDocumentType;
        dependency: PrismaDependency | null;
      };
      participationMechanism: PrismaParticipationMechanism;
      event?: PrismaEvent | null;
    },
  ): Registration {
    return {
      id: registration.id,
      user: User.fromPrisma(
        registration.user as PrismaUser & {
          userType: PrismaUserType;
          documentType: PrismaDocumentType;
          dependency: PrismaDependency | null;
        },
      ),
      participationMechanism: ParticipationMechanism.fromPrisma(registration.participationMechanism),
      event: registration.event ? Event.fromPrisma(registration.event) : null,
      simiEventCode: registration.simiEventCode,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
    };
  }

  @ApiProperty({
    description: 'The id of the registration',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The user of the registration',
  })
  user: User;

  @ApiProperty({
    description: 'The participation mechanism of the registration',
  })
  participationMechanism: ParticipationMechanism;

  @ApiPropertyOptional({
    description: 'The event of the registration',
  })
  event?: Event | null;

  @ApiPropertyOptional({
    description: 'The simi event code of the registration',
    example: '1234567890',
  })
  simiEventCode?: string | null;

  @ApiProperty({
    description: 'The created at of the registration',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the registration',
    example: new Date(),
  })
  updatedAt?: Date | null;
}
