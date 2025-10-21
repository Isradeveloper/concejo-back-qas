import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalRegister } from './proposal-register.entity';
import { Registration } from './registration.entity';
import { RegistrationCite } from './registration-cite.entity';
import {
  ProposalRegister as PrismaProposalRegister,
  ProposalStatus as PrismaProposalStatus,
  Registration as PrismaRegistration,
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  ParticipationMechanism as PrismaParticipationMechanism,
  RegistrationCite as PrismaRegistrationCite,
  CiteQuestion as PrismaCiteQuestion,
  Dependency as PrismaDependency,
} from '@prisma/client';

export class ProposalRegisterDetail extends ProposalRegister {
  static fromPrisma(
    proposalRegister: PrismaProposalRegister & {
      proposalStatus: PrismaProposalStatus;
      registration: PrismaRegistration & {
        user: PrismaUser & { userType: PrismaUserType; documentType: PrismaDocumentType };
        participationMechanism: PrismaParticipationMechanism;
      };
      RegistrationCite?: (PrismaRegistrationCite & {
        user?: PrismaUser & {
          userType: PrismaUserType;
          documentType: PrismaDocumentType;
          dependency: PrismaDependency;
        };
        CiteQuestion?: PrismaCiteQuestion[];
      })[];
    },
  ): ProposalRegisterDetail {
    const baseRegister = ProposalRegister.fromPrisma(proposalRegister);

    return {
      ...baseRegister,
      simiEventCode: proposalRegister.simiEventCode,
      politicalTopic: proposalRegister.politicalTopic,
      politicalTopicJustification: proposalRegister.politicalTopicJustification,
      registration: Registration.fromPrisma(
        proposalRegister.registration as PrismaRegistration & {
          user: PrismaUser & {
            userType: PrismaUserType;
            documentType: PrismaDocumentType;
            dependency: PrismaDependency;
          };
          participationMechanism: PrismaParticipationMechanism;
        },
      ),
      registrationCites: proposalRegister.RegistrationCite
        ? proposalRegister.RegistrationCite.map((rc) => RegistrationCite.fromPrisma(rc))
        : [],
    };
  }

  @ApiPropertyOptional({
    description: 'The simi event code of the proposal register',
    example: 'abc123',
  })
  simiEventCode?: string | null;

  @ApiPropertyOptional({
    description: 'The political topic of the proposal register',
    example: 'Environmental protection',
  })
  politicalTopic?: string | null;

  @ApiPropertyOptional({
    description: 'The political topic justification of the proposal register',
    example: 'This topic is important for our community...',
  })
  politicalTopicJustification?: string | null;

  @ApiProperty({
    description: 'The registration of the proposal register',
    type: () => Registration,
  })
  registration: Registration;

  @ApiProperty({
    description: 'The registration cites associated with this proposal register',
    type: [RegistrationCite],
    isArray: true,
  })
  registrationCites: RegistrationCite[];
}
