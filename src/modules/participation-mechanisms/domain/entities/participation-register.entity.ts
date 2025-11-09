import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Registration } from './registration.entity';
import {
  ParticipationRegister as PrismaParticipationRegister,
  Registration as PrismaRegistration,
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  ParticipationMechanism as PrismaParticipationMechanism,
  Dependency as PrismaDependency,
  Event as PrismaEvent,
} from '@prisma/client';

export class ParticipationRegister {
  static fromPrisma(
    participationRegister: PrismaParticipationRegister & {
      registration: PrismaRegistration & {
        user: PrismaUser & {
          userType: PrismaUserType;
          documentType: PrismaDocumentType;
          dependency: PrismaDependency | null;
        };
        participationMechanism: PrismaParticipationMechanism;
        event?: PrismaEvent | null;
      };
    },
  ): ParticipationRegister {
    return {
      id: participationRegister.id,
      registration: Registration.fromPrisma(
        participationRegister.registration as PrismaRegistration & {
          user: PrismaUser & {
            userType: PrismaUserType;
            documentType: PrismaDocumentType;
            dependency: PrismaDependency | null;
          };
          participationMechanism: PrismaParticipationMechanism;
          event?: PrismaEvent | null;
        },
      ),
      simiEventCode: participationRegister.simiEventCode,
      ownUser: participationRegister.ownUser,
      organizationName: participationRegister.organizationName,
      organizationNit: participationRegister.organizationNit,
      organizationEmail: participationRegister.organizationEmail,
      organizationRole: participationRegister.organizationRole,
      createdAt: participationRegister.createdAt,
      updatedAt: participationRegister.updatedAt,
    };
  }

  @ApiProperty({
    description: 'The id of the participation register',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The registration of the participation register',
    example: 1,
  })
  registration: Registration;

  @ApiProperty({
    description: 'The simi event code of the participation register',
    example: 'abc123',
  })
  simiEventCode: string;

  @ApiProperty({
    description: 'The own user of the participation register',
    example: true,
  })
  ownUser: boolean;

  @ApiPropertyOptional({
    description: 'The organization name of the participation register',
    example: 'Organization Name',
  })
  organizationName?: string | null;

  @ApiPropertyOptional({
    description: 'The organization nit of the participation register',
    example: '1234567890',
  })
  organizationNit?: string | null;

  @ApiPropertyOptional({
    description: 'The organization email of the participation register',
    example: 'organization@example.com',
  })
  organizationEmail?: string | null;

  @ApiPropertyOptional({
    description: 'The organization role of the participation register',
    example: 'Organization Role',
  })
  organizationRole?: string | null;

  @ApiProperty({
    description: 'The created at of the participation register',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the participation register',
    example: new Date(),
  })
  updatedAt?: Date | null;
}
