import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProposalRegister as PrismaProposalRegister,
  type ProposalStatus as PrismaProposalStatus,
  type Registration as PrismaRegistration,
  type User as PrismaUser,
  type RegistrationCite as PrismaRegistrationCite,
  type CiteQuestion as PrismaCiteQuestion,
} from '@prisma/client';

export class ProposalRegister {
  static fromPrisma(
    proposalRegister: PrismaProposalRegister & {
      proposalStatus: PrismaProposalStatus;
      registration?: PrismaRegistration & {
        user?: Partial<PrismaUser>;
      };
      RegistrationCite?: (PrismaRegistrationCite & {
        user?: Partial<PrismaUser>;
        CiteQuestion?: PrismaCiteQuestion[];
      })[];
    },
  ): ProposalRegister {
    return {
      id: proposalRegister.id,
      simiEventCode: proposalRegister.simiEventCode,
      politicalTopic: proposalRegister.politicalTopic,
      politicalTopicJustification: proposalRegister.politicalTopicJustification,
      proposalStatus: proposalRegister.proposalStatus,
      registration: proposalRegister.registration,
      RegistrationCite: proposalRegister.RegistrationCite,
      createdAt: proposalRegister.createdAt,
      updatedAt: proposalRegister.updatedAt || null,
    };
  }

  @ApiProperty({
    description: 'The id of the proposal register',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The SIMI event code',
    example: 'EVT001',
  })
  simiEventCode: string | null;

  @ApiProperty({
    description: 'The political topic of the proposal',
    example: 'Environmental protection',
  })
  politicalTopic: string | null;

  @ApiProperty({
    description: 'The justification for the political topic',
    example: 'This topic is important for the community',
  })
  politicalTopicJustification: string | null;

  @ApiProperty({
    description: 'The proposal status of the proposal register',
    example: {
      id: 1,
      name: 'Pending',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  proposalStatus: PrismaProposalStatus;

  @ApiPropertyOptional({
    description: 'The registration information',
  })
  registration?: PrismaRegistration & {
    user?: Partial<PrismaUser>;
  };

  @ApiPropertyOptional({
    description: 'The registration cites',
    isArray: true,
  })
  RegistrationCite?: (PrismaRegistrationCite & {
    user?: Partial<PrismaUser>;
    CiteQuestion?: PrismaCiteQuestion[];
  })[];

  @ApiProperty({
    description: 'The created at of the proposal register',
    example: new Date(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at of the proposal register',
    example: new Date(),
  })
  updatedAt: Date | null;
}
