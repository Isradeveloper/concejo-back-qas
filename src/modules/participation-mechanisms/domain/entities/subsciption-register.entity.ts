import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Registration } from './registration.entity';
import {
  SubscriptionRegister as PrismaSubscriptionRegister,
  Registration as PrismaRegistration,
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  ParticipationMechanism as PrismaParticipationMechanism,
  Dependency as PrismaDependency,
  Event as PrismaEvent,
} from '@prisma/client';

export class SubscriptionRegister {
  static fromPrisma(
    subscriptionRegister: PrismaSubscriptionRegister & {
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
  ): SubscriptionRegister {
    return {
      id: subscriptionRegister.id,
      registration: Registration.fromPrisma(
        subscriptionRegister.registration as PrismaRegistration & {
          user: PrismaUser & {
            userType: PrismaUserType;
            documentType: PrismaDocumentType;
            dependency: PrismaDependency | null;
          };
          participationMechanism: PrismaParticipationMechanism;
          event?: PrismaEvent | null;
        },
      ),
      simiTopicId: subscriptionRegister.simiTopicId,
      topic: subscriptionRegister.topic,
      createdAt: subscriptionRegister.createdAt,
      updatedAt: subscriptionRegister.updatedAt,
    };
  }

  @ApiProperty({
    description: 'The id of the subscription register',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The registration of the subscription register',
    example: 1,
  })
  registration: Registration;

  @ApiProperty({
    description: 'The simi topic id of the subscription register',
    example: '1',
  })
  simiTopicId: string;

  @ApiProperty({
    description: 'The topic name of the subscription register',
    example: 'salud',
  })
  topic: string;

  @ApiProperty({
    description: 'The created at of the subscription register',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the subscription register',
    example: new Date(),
  })
  updatedAt?: Date | null;
}
