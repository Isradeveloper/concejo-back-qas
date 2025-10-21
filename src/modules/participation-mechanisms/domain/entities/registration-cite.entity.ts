import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CiteQuestion } from './cite-question.entity';
import { User } from '../../../users/domain/entities/user.entity';
import {
  RegistrationCite as PrismaRegistrationCite,
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  CiteQuestion as PrismaCiteQuestion,
  Dependency as PrismaDependency,
} from '@prisma/client';

export class RegistrationCite {
  static fromPrisma(
    registrationCite: PrismaRegistrationCite & {
      user?: PrismaUser & { userType: PrismaUserType; documentType: PrismaDocumentType };
      CiteQuestion?: PrismaCiteQuestion[];
    },
  ): RegistrationCite {
    return {
      id: registrationCite.id,
      proposalRegisterId: registrationCite.proposalRegisterId,
      userId: registrationCite.userId,
      createdAt: registrationCite.createdAt,
      updatedAt: registrationCite.updatedAt,
      user: registrationCite.user
        ? User.fromPrisma(
            registrationCite.user as PrismaUser & {
              userType: PrismaUserType;
              documentType: PrismaDocumentType;
              dependency: PrismaDependency;
            },
          )
        : undefined,
      citeQuestions: registrationCite.CiteQuestion
        ? registrationCite.CiteQuestion.map((cq) => CiteQuestion.fromPrisma(cq))
        : [],
    };
  }

  @ApiProperty({
    description: 'The id of the registration cite',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The proposal register id',
    example: 1,
  })
  proposalRegisterId: number;

  @ApiProperty({
    description: 'The user id who is cited',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'The date when the registration cite was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The date when the registration cite was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'The user who is cited',
    type: () => User,
  })
  user?: User;

  @ApiProperty({
    description: 'The cite questions associated with this registration cite',
    type: [CiteQuestion],
    isArray: true,
  })
  citeQuestions: CiteQuestion[];
}
